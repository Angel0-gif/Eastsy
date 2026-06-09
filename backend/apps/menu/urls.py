from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuItemViewSet, categories

router = DefaultRouter()
router.register('items', MenuItemViewSet, basename='menu-item')

urlpatterns = [
    path('', include(router.urls)),
    path('categories/', categories, name='menu-categories'),
]
