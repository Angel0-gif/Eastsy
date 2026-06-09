from django.db import models
from django.conf import settings
from apps.menu.models import MenuItem
from apps.reservations.models import Table


class Order(models.Model):
    STATUS_CHOICES = [
        ('received',   'Received'),
        ('confirmed',  'Confirmed'),
        ('preparing',  'Preparing'),
        ('on_the_way', 'On the Way'),
        ('delivered',  'Delivered'),
    ]
    user         = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    table        = models.ForeignKey(Table, on_delete=models.SET_NULL, null=True, related_name='orders')
    order_number = models.CharField(max_length=20, unique=True)
    status       = models.CharField(max_length=12, choices=STATUS_CHOICES, default='received', db_index=True)
    subtotal     = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    service_fee  = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    total        = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return f'Order {self.order_number} — {self.status}'

    def calculate_totals(self):
        self.subtotal    = sum(i.subtotal for i in self.items.all())
        self.service_fee = round(self.subtotal * 5 / 100)
        self.total       = self.subtotal + self.service_fee
        self.save(update_fields=['subtotal', 'service_fee', 'total'])

    @staticmethod
    def generate_number():
        import uuid
        return 'ESY-' + str(uuid.uuid4())[:6].upper()


class OrderItem(models.Model):
    order     = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT)
    quantity  = models.PositiveSmallIntegerField(default=1)
    subtotal  = models.DecimalField(max_digits=10, decimal_places=0, default=0)

    class Meta:
        db_table = 'order_items'

    def save(self, *args, **kwargs):
        self.subtotal = self.menu_item.price * self.quantity
        super().save(*args, **kwargs)
