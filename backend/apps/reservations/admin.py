from django.contrib import admin
from .models import Table, Reservation


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display  = ['number', 'seats', 'location', 'status']
    list_editable = ['status']
    ordering      = ['number']


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display   = ['id', 'user', 'table', 'date', 'time', 'guest_count', 'status']
    list_filter    = ['status', 'date']
    search_fields  = ['user__email', 'user__full_name']
    ordering       = ['-date', '-time']
    date_hierarchy = 'date'
