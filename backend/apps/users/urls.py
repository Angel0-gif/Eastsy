from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from . import views

urlpatterns = [
    path('register/',      views.register,                   name='auth-register'),
    path('login/',         views.login,                      name='auth-login'),
    path('token/refresh/', TokenRefreshView.as_view(),       name='token-refresh'),
    path('logout/',        TokenBlacklistView.as_view(),     name='auth-logout'),
    path('me/',            views.MeView.as_view(),           name='auth-me'),
    path('customers/',     views.CustomerListView.as_view(), name='customer-list'),
]
