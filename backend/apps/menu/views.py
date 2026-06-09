from rest_framework import viewsets, filters, serializers, parsers
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import MenuItem
from apps.users.permissions import IsAdmin


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model        = MenuItem
        fields       = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class MenuItemViewSet(viewsets.ModelViewSet):
    """
    Public:        GET  (list / retrieve)
    Admin only:    POST / PUT / PATCH / DELETE / toggle
    """
    serializer_class = MenuItemSerializer
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_available']
    search_fields    = ['name', 'description']
    ordering_fields  = ['price', 'name', 'created_at']

    # Accept multipart (for image uploads) AND JSON
    parser_classes = [
        parsers.MultiPartParser,
        parsers.FormParser,
        parsers.JSONParser,
    ]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        # All write operations require admin
        return [IsAuthenticated(), IsAdmin()]

    def get_queryset(self):
        user = self.request.user
        # Admin sees all items (including unavailable)
        if user.is_authenticated and user.is_admin:
            return MenuItem.objects.all().order_by('category', 'name')
        # Customers only see available items
        return MenuItem.objects.filter(is_available=True).order_by('category', 'name')

    def perform_create(self, serializer):
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        """PATCH — supports both JSON and multipart/form-data."""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=['patch'], url_path='toggle')
    def toggle_availability(self, request, pk=None):
        """PATCH /api/menu/items/{id}/toggle/ — flip available on/off."""
        item              = self.get_object()
        item.is_available = not item.is_available
        item.save(update_fields=['is_available'])
        return Response({'id': item.id, 'is_available': item.is_available})


@api_view(['GET'])
@permission_classes([AllowAny])
def categories(request):
    return Response([
        {'value': v, 'label': l}
        for v, l in MenuItem.CATEGORY_CHOICES
    ])
