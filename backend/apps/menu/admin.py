from django.contrib import admin
from .models import MenuItem


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display   = ['emoji', 'name', 'category', 'price', 'is_available']
    list_filter    = ['category', 'is_available']
    search_fields  = ['name', 'description']
    list_editable  = ['is_available']
    ordering       = ['category', 'name']
