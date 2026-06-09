import uuid
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from apps.orders.models import Order
from .models import Payment
from .serializers import PaymentInitiateSerializer, PaymentSerializer


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def initiate(request):
    """POST /api/payments/initiate/ — customer pays for their order."""
    ser = PaymentInitiateSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    data = ser.validated_data

    try:
        order = Order.objects.get(pk=data['order_id'], user=request.user)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Simulate payment success
    # In production: call MTN MoMo / Orange Money API with data['phone_number']
    payment = Payment.objects.create(
        order     = order,
        user      = request.user,
        method    = data['method'],
        amount    = order.total,
        status    = 'success',
        reference = 'PAY-' + str(uuid.uuid4())[:8].upper(),
    )

    order.status = 'confirmed'
    order.save(update_fields=['status'])

    # Award loyalty points: 1 pt per 100 XAF
    pts = int(order.total) // 100
    request.user.add_points(pts)

    return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def detail(request, pk):
    """GET /api/payments/{id}/ — check payment status."""
    try:
        payment = Payment.objects.get(pk=pk, user=request.user)
    except Payment.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(PaymentSerializer(payment).data)
