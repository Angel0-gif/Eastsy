from rest_framework import serializers
from apps.menu.serializers import MenuItemSerializer
from apps.reservations.serializers import TableSerializer
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSerializer(read_only=True)
    menu_item_id = serializers.IntegerField(write_only=True)

    class Meta:
        model  = OrderItem
        fields = ['id', 'menu_item', 'menu_item_id', 'quantity', 'subtotal']
        read_only_fields = ['id', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    table = TableSerializer(read_only=True)
    table_id = serializers.IntegerField(write_only=True)

    class Meta:
        model  = Order
        fields = ['id', 'order_number', 'user', 'table', 'table_id',
                  'items', 'status', 'subtotal', 'service_fee', 'total',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'order_number', 'user', 'status',
                            'subtotal', 'service_fee', 'total', 'created_at', 'updated_at']

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
            OrderItem.objects.create(order=order, **item_data)
        order.calculate_totals()
        return order
