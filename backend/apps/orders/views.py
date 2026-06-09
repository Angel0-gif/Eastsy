from rest_framework import viewsets, permissions, serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from apps.menu.models import MenuItem
from apps.reservations.models import Table
from apps.users.permissions import IsAdmin
from .models import Order, OrderItem


# ── SERIALIZERS ───────────────────────────────────────────────────────────────

class MenuItemMinSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MenuItem
        fields = ['id', 'name', 'emoji', 'price']


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item    = MenuItemMinSerializer(read_only=True)
    menu_item_id = serializers.IntegerField(write_only=True)

    class Meta:
        model  = OrderItem
        fields = ['id', 'menu_item', 'menu_item_id', 'quantity', 'subtotal']
        read_only_fields = ['id', 'subtotal']


class TableMinSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Table
        fields = ['id', 'number', 'seats']


class OrderSerializer(serializers.ModelSerializer):
    items      = OrderItemSerializer(many=True)
    table      = TableMinSerializer(read_only=True)
    table_id   = serializers.IntegerField(write_only=True)
    user_name  = serializers.CharField(source='user.full_name', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)

    class Meta:
        model  = Order
        fields = ['id', 'order_number', 'user', 'user_name', 'user_phone',
                  'table', 'table_id', 'items', 'status',
                  'subtotal', 'service_fee', 'total',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'order_number', 'user', 'user_name', 'user_phone',
                            'status', 'subtotal', 'service_fee', 'total',
                            'created_at', 'updated_at']

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        table_id   = validated_data.pop('table_id')
        order = Order.objects.create(
            user=self.context['request'].user,
            table_id=table_id,
            order_number=Order.generate_number(),
            **validated_data
        )
        for item_data in items_data:
            menu_item = MenuItem.objects.get(pk=item_data['menu_item_id'])
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=item_data['quantity'],
                subtotal=menu_item.price * item_data['quantity']
            )
        order.calculate_totals()
        return order


class OrderStatusSerializer(serializers.Serializer):
    STATUS_CHOICES = ['received', 'confirmed', 'preparing', 'on_the_way', 'delivered']
    status = serializers.ChoiceField(choices=STATUS_CHOICES)


# ── VIEW ──────────────────────────────────────────────────────────────────────

class OrderViewSet(viewsets.ModelViewSet):
    """
    Customers → see only their own orders.
    Admin     → sees ALL orders, can filter, can update status.

    GET    /api/orders/                   → list
    POST   /api/orders/                   → customer places order
    GET    /api/orders/{id}/              → detail
    GET    /api/orders/{id}/track/        → tracking status
    PATCH  /api/orders/{id}/set_status/   → Admin advances status
    """
    serializer_class   = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names  = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        qs   = Order.objects.prefetch_related(
            'items__menu_item'
        ).select_related('table', 'user')

    # Fix for swagger/anonymous access
        if not user or not user.is_authenticated:
            return qs.none()

        if user.is_admin:
            date_filter   = self.request.query_params.get('date')
            status_filter = self.request.query_params.get('status')
            if date_filter:
                qs = qs.filter(created_at__date=date_filter)
            if status_filter:
                qs = qs.filter(status=status_filter)
            return qs.order_by('-created_at')

        return qs.filter(user=user).order_by('-created_at')

    @action(detail=True, methods=['get'], url_path='track')
    def track(self, request, pk=None):
        order = self.get_object()
        return Response({
            'id':           order.id,
            'order_number': order.order_number,
            'status':       order.status,
            'updated_at':   order.updated_at,
        })

    @action(detail=True, methods=['patch'], url_path='set_status',
            permission_classes=[permissions.IsAuthenticated, IsAdmin])
    def set_status(self, request, pk=None):
        """Admin advances order through the pipeline."""
        order = self.get_object()
        ser   = OrderStatusSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        order.status = ser.validated_data['status']
        order.save(update_fields=['status', 'updated_at'])
        return Response({'id': order.id, 'status': order.status})
