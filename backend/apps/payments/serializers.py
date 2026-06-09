from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model        = Payment
        fields       = ['id', 'order', 'method', 'amount', 'status', 'reference', 'created_at']
        read_only_fields = ['id', 'status', 'reference', 'created_at']


class PaymentInitiateSerializer(serializers.Serializer):
    order_id     = serializers.IntegerField()
    method       = serializers.ChoiceField(choices=['momo', 'card', 'table'])
    phone_number = serializers.CharField(required=False, allow_blank=True)
    card_token   = serializers.CharField(required=False, allow_blank=True)
