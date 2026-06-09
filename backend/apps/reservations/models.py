from django.db import models
from django.conf import settings


class Table(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied',  'Occupied'),
        ('reserved',  'Reserved'),
    ]
    number   = models.PositiveSmallIntegerField(unique=True)
    seats    = models.PositiveSmallIntegerField()
    status   = models.CharField(max_length=10, choices=STATUS_CHOICES, default='available')
    location = models.CharField(max_length=50, default='Main Hall', blank=True)

    class Meta:
        db_table = 'tables'
        ordering = ['number']

    def __str__(self):
        return f'Table {self.number} ({self.seats} seats)'


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('no_show',   'No Show'),
    ]
    user             = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reservations')
    table            = models.ForeignKey(Table, on_delete=models.PROTECT, related_name='reservations')
    date             = models.DateField(db_index=True)
    time             = models.TimeField()
    guest_count      = models.PositiveSmallIntegerField()
    special_requests = models.TextField(blank=True)
    status           = models.CharField(max_length=10, choices=STATUS_CHOICES, default='confirmed')
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reservations'
        ordering = ['-date', '-time']
        indexes  = [models.Index(fields=['date', 'time'])]

    def __str__(self):
        return f'Reservation #{self.pk} — {self.user} — {self.date} {self.time}'
