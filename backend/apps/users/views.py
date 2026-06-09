from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from drf_spectacular.utils import extend_schema
from .models import User
from .serializers import (
    RegisterSerializer, LoginSerializer,
    UserSerializer, get_tokens
)
from .permissions import IsAdmin


@extend_schema(request=LoginSerializer, responses=None)
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login for admin and customers.
    Returns is_admin=true if admin → frontend redirects to /admin/dashboard
    Returns is_admin=false if customer → frontend redirects to /tabs/home
    """
    ser = LoginSerializer(data=request.data, context={'request': request})
    ser.is_valid(raise_exception=True)
    user = ser.validated_data['user']
    return Response(get_tokens(user))


@extend_schema(request=RegisterSerializer, responses=None)
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Customer self-registration."""
    ser = RegisterSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    user = ser.save()
    return Response(get_tokens(user), status=status.HTTP_201_CREATED)


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PUT /api/auth/me/ — current user profile."""
    serializer_class   = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class CustomerListView(generics.ListAPIView):
    """GET /api/auth/customers/ — admin only."""
    serializer_class   = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return User.objects.filter(is_admin=False).order_by('-date_joined')