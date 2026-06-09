from django.db import models


class MenuItem(models.Model):
    CATEGORY_CHOICES = [
        ('starter', 'Starter'),
        ('main',    'Main Course'),
        ('dessert', 'Dessert'),
        ('drinks',  'Drinks'),
        ('special', "Chef's Special"),
    ]

    name         = models.CharField(max_length=120)
    description  = models.TextField()
    price        = models.DecimalField(max_digits=10, decimal_places=0)
    category     = models.CharField(max_length=10, choices=CATEGORY_CHOICES, db_index=True)
    emoji        = models.CharField(max_length=10, default='🍽️')
    tags         = models.JSONField(default=list, blank=True)
    allergens    = models.CharField(max_length=200, blank=True)
    calories     = models.PositiveIntegerField(default=0)
    image        = models.ImageField(upload_to='menu/', null=True, blank=True)
    is_available = models.BooleanField(default=True, db_index=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'menu_items'
        ordering = ['category', 'name']

    def __str__(self):
        return f'{self.name} ({self.get_category_display()})'
