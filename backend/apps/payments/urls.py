from django.urls import path
from . import views

urlpatterns = [
    path('initiate/', views.initiate, name='payment-initiate'),
    path('<int:pk>/', views.detail,   name='payment-detail'),
]
