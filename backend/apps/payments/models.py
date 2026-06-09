from django.db import models
from django.conf import settings
from apps.orders.models import Order


class Payment(models.Model):
    METHOD_CHOICES = [
        ('momo',  'Mobile Money'),
        ('card',  'Card'),
        ('table', 'Pay at Table'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed',  'Failed'),
    ]

    order      = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    method     = models.CharField(max_length=10, choices=METHOD_CHOICES)
    amount     = models.DecimalField(max_digits=10, decimal_places=0)
    status     = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    reference  = models.CharField(max_length=60, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'

    def __str__(self):
        return f'Payment {self.reference} — {self.status}'
