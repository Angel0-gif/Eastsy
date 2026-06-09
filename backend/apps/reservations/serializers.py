from rest_framework import serializers
from .models import Table, Reservation


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Table
        fields = ['id', 'number', 'seats', 'status']


class ReservationSerializer(serializers.ModelSerializer):
    table = TableSerializer(read_only=True)
    table_id = serializers.PrimaryKeyRelatedField(
        queryset=Table.objects.all(), write_only=True, source='table'
    )

    class Meta:
        model  = Reservation
        fields = ['id', 'user', 'table', 'table_id', 'date', 'time',
                  'guest_count', 'special_requests', 'status', 'created_at']
        read_only_fields = ['id', 'user', 'status', 'created_at']

    def validate(self, data):
        # Prevent double-booking same table at same date/time
        qs = Reservation.objects.filter(
            table=data['table'], date=data['date'], time=data['time'],
            status__in=['pending', 'confirmed']
        )
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError({'table_id': 'This table is already booked for that date and time.'})
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
