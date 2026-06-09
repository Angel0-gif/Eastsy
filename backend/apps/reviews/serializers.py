from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model        = Review
        fields       = ['id', 'user', 'user_name', 'order', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'user_name', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
