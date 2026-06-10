import uuid
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from apps.orders.models import Order
from .models import Payment
from .serializers import PaymentInitiateSerializer, PaymentSerializer
from .momo import request_payment, check_payment_status


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def initiate(request):
    ser = PaymentInitiateSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    data = ser.validated_data

    # 1. Get the real order (must belong to this user)
    try:
        order = Order.objects.get(pk=data['order_id'], user=request.user)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found.'}, status=404)

    # 2. Prevent double payment
    if hasattr(order, 'payment') and order.payment.status == 'success':
        return Response({'detail': 'Order already paid.'}, status=400)

    # 3. Generate a unique payment reference
    reference = 'PAY-' + str(uuid.uuid4())[:8].upper()

    # 4. Create a PENDING payment record immediately
    payment = Payment.objects.create(
        order=order,
        user=request.user,
        method=data['method'],
        amount=order.total,
        status='pending',
        reference=reference,
    )

    # 5a. MTN MoMo — send push notification to customer's phone
    if data['method'] == 'momo':
        phone = data.get('phone_number', '').replace('+', '').strip()
        if not phone:
            payment.delete()
            return Response({'detail': 'Phone number required for MoMo.'}, status=400)

        try:
            request_payment(
                phone=phone,
                amount=int(order.total),
                reference=reference,
                note=f"EATSY Order {order.order_number}",
            )
            # Return 202 — payment is async, customer must approve on their phone
            return Response({
                'reference': reference,
                'status':    'pending',
                'message':   'Payment request sent. Please approve on your phone.',
            }, status=202)

        except Exception as e:
            payment.status = 'failed'
            payment.save()
            return Response(
                {'detail': f'MoMo request failed: {str(e)}'},
                status=502
            )

    # 5b. Pay at table — instant confirmation, no external API needed
    elif data['method'] == 'table':
        payment.status = 'success'
        payment.save()
        order.status = 'confirmed'
        order.save(update_fields=['status'])
        # Award loyalty points (1 point per 100 XAF)
        pts = int(order.total) // 100
        request.user.add_points(pts)
        return Response(PaymentSerializer(payment).data, status=201)

    return Response({'detail': 'Unsupported payment method.'}, status=400)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def poll_status(request, reference):
    """
    Frontend calls this every 5 seconds after initiating MoMo payment.
    GET /api/payments/status/<reference>/
    Returns: { reference, status, amount }
    """
    try:
        payment = Payment.objects.get(reference=reference, user=request.user)
    except Payment.DoesNotExist:
        return Response({'detail': 'Payment not found.'}, status=404)

    # Only poll MoMo if still pending
    if payment.status == 'pending':
        try:
            momo_status = check_payment_status(reference)

            if momo_status == 'SUCCESSFUL':
                payment.status = 'success'
                payment.save()
                payment.order.status = 'confirmed'
                payment.order.save(update_fields=['status'])
                # Award loyalty points
                pts = int(payment.amount) // 100
                request.user.add_points(pts)

            elif momo_status == 'FAILED':
                payment.status = 'failed'
                payment.save()

            # PENDING → keep polling, do nothing

        except Exception:
            pass  # Network error — keep polling, don't fail

    return Response({
        'reference': payment.reference,
        'status':    payment.status,
        'amount':    payment.amount,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def detail(request, pk):
    try:
        payment = Payment.objects.get(pk=pk, user=request.user)
    except Payment.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=404)
    return Response(PaymentSerializer(payment).data)