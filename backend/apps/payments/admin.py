from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display    = ['reference', 'order', 'user', 'method', 'amount', 'status', 'created_at']
    list_filter     = ['method', 'status']
    search_fields   = ['reference', 'user__email']
    ordering        = ['-created_at']
    readonly_fields = ['reference', 'created_at']
