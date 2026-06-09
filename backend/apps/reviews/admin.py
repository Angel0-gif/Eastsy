from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ['user', 'rating', 'comment', 'created_at']
    list_filter   = ['rating']
    search_fields = ['user__email', 'comment']
    ordering      = ['-created_at']
