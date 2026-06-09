from rest_framework import viewsets, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Table, Reservation
from apps.users.permissions import IsAdmin


# ── SERIALIZERS ───────────────────────────────────────────────────────────────

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Table
        fields = ['id', 'number', 'seats', 'status', 'location']


class ReservationSerializer(serializers.ModelSerializer):
    table     = TableSerializer(read_only=True)
    table_id  = serializers.PrimaryKeyRelatedField(
        queryset=Table.objects.all(), write_only=True, source='table'
    )
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model  = Reservation
        fields = ['id', 'user', 'user_name', 'table', 'table_id',
                  'date', 'time', 'guest_count', 'special_requests',
                  'status', 'created_at']
        read_only_fields = ['id', 'user', 'user_name', 'status', 'created_at']

    def validate(self, data):
        qs = Reservation.objects.filter(
            table=data['table'],
            date=data['date'],
            time=data['time'],
            status__in=['pending', 'confirmed']
        )
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                {'table_id': 'This table is already booked for that slot.'}
            )
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# ── TABLE VIEWSET ─────────────────────────────────────────────────────────────

class TableViewSet(viewsets.ModelViewSet):
    """
    Tables are shared between admin and clients.
    - Admin adds/edits/deletes tables → clients see them immediately.
    - Admin changes status → clients see updated availability immediately.

    Public:      GET /api/tables/                   → list all tables
    Public:      GET /api/tables/?date=X&time=Y     → with booking status
    Admin only:  POST / PUT / PATCH / DELETE
    """
    serializer_class = TableSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdmin()]

    def get_queryset(self):
        return Table.objects.all().order_by('number')

    def list(self, request, *args, **kwargs):
        """
        Override list to mark tables as occupied when they have
        a confirmed reservation for the requested date + time.
        """
        date = request.query_params.get('date')
        time = request.query_params.get('time')
        tables = Table.objects.all().order_by('number')

        if date and time:
            # Find tables that are booked for this date+time
            booked_ids = Reservation.objects.filter(
                date=date,
                time=time,
                status__in=['pending', 'confirmed']
            ).values_list('table_id', flat=True)

            result = []
            for t in tables:
                data = TableSerializer(t).data
                # If admin set it as occupied/reserved keep that status
                # If it's available but has a booking → mark as occupied
                if t.id in booked_ids and t.status == 'available':
                    data['status'] = 'occupied'
                result.append(data)
            return Response(result)

        return Response(TableSerializer(tables, many=True).data)


# ── RESERVATION VIEWSET ───────────────────────────────────────────────────────

class ReservationViewSet(viewsets.ModelViewSet):
    """
    Customers  → see only their own reservations.
    Admin      → sees all reservations, can filter by date.
    """
    serializer_class   = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs   = Reservation.objects.select_related('table', 'user')

        # Prevent swagger crash on anonymous access
        if not user or not user.is_authenticated:
            return qs.none()

        if user.is_admin:
            date = self.request.query_params.get('date')
            if date:
                qs = qs.filter(date=date)
            return qs.order_by('-date', '-time')

        return qs.filter(user=user).order_by('-date', '-time')

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]
