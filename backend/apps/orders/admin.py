from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model           = OrderItem
    extra           = 0
    fields          = ['menu_item', 'quantity', 'subtotal']
    readonly_fields = ['subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display    = ['order_number', 'user', 'table', 'status', 'total', 'created_at']
    list_filter     = ['status', 'created_at']
    search_fields   = ['order_number', 'user__email', 'user__full_name']
    list_editable   = ['status']
    ordering        = ['-created_at']
    inlines         = [OrderItemInline]
    readonly_fields = ['order_number', 'subtotal', 'service_fee', 'total']
    date_hierarchy  = 'created_at'
