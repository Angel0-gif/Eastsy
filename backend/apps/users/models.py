from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, full_name, password=None, **extra):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user  = self.model(email=email, full_name=full_name, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password):
        user              = self.create_user(email, full_name, password)
        user.is_admin     = True
        user.is_staff     = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    TIER_CHOICES = [
        ('Bronze',   'Bronze'),
        ('Silver',   'Silver'),
        ('Gold',     'Gold'),
        ('Platinum', 'Platinum'),
    ]

    email          = models.EmailField(unique=True)
    full_name      = models.CharField(max_length=120)
    phone          = models.CharField(max_length=20, blank=True)
    avatar         = models.ImageField(upload_to='avatars/', null=True, blank=True)
    # Simple flag: True = admin, False = customer
    is_admin       = models.BooleanField(default=False, db_index=True)
    loyalty_points = models.PositiveIntegerField(default=0)
    tier           = models.CharField(max_length=10, choices=TIER_CHOICES, default='Bronze')
    is_verified    = models.BooleanField(default=False)
    is_active      = models.BooleanField(default=True)
    is_staff       = models.BooleanField(default=False)
    date_joined    = models.DateTimeField(auto_now_add=True)

    objects        = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table     = 'users'
        verbose_name = 'User'

    def __str__(self):
        tag = 'ADMIN' if self.is_admin else 'customer'
        return f'{self.full_name} <{self.email}> [{tag}]'

    def add_points(self, pts: int):
        self.loyalty_points += pts
        self._update_tier()
        self.save(update_fields=['loyalty_points', 'tier'])

    def _update_tier(self):
        p = self.loyalty_points
        if   p >= 5000: self.tier = 'Platinum'
        elif p >= 2000: self.tier = 'Gold'
        elif p >= 500:  self.tier = 'Silver'
        else:           self.tier = 'Bronze'
