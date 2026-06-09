from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display    = ['email', 'full_name', 'is_admin', 'tier', 'loyalty_points', 'is_active', 'date_joined']
    list_filter     = ['is_admin', 'tier', 'is_active']
    search_fields   = ['email', 'full_name', 'phone']
    ordering        = ['-date_joined']
    fieldsets = (
        (None,          {'fields': ('email', 'password')}),
        ('Personal',    {'fields': ('full_name', 'phone')}),
        ('Admin & Tier',{'fields': ('is_admin', 'tier', 'loyalty_points', 'is_verified')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'full_name', 'is_admin', 'password1', 'password2'),
        }),
    )
