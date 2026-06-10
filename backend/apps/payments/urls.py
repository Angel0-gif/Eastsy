from django.urls import path
from . import views

urlpatterns = [
    path('initiate/',                  views.initiate,     name='payment-initiate'),
    path('status/<str:reference>/',    views.poll_status,  name='payment-poll'),
    path('<int:pk>/',                  views.detail,       name='payment-detail'),
]