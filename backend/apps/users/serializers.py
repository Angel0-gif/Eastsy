from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'full_name', 'email', 'phone', 'avatar', 'is_admin', 'loyalty_points', 'tier', 'is_verified']
        read_only_fields = ['id', 'is_admin', 'loyalty_points', 'tier', 'is_verified']


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['full_name', 'email', 'phone', 'avatar', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        # Customers always register as non-admin
        validated_data['is_admin'] = False
        return User.objects.create_user(**validated_data)


from django.contrib.auth import authenticate, get_user_model

class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        from django.contrib.auth import get_user_model
        User     = get_user_model()
        email    = data.get('email', '').strip().lower()
        password = data.get('password', '')

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('No account found with this email.')

        if not user.check_password(password):
            raise serializers.ValidationError('Incorrect password.')

        if not user.is_active:
            raise serializers.ValidationError('This account is disabled.')

        data['user'] = user
        return data

def get_tokens(user) -> dict:
    """Generate JWT access + refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
        'user':    UserSerializer(user).data,
    }
