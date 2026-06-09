from django.urls import path
from . import views

urlpatterns = [
    path('daily/',     views.daily_report,    name='report-daily'),
    path('weekly/',    views.weekly_summary,  name='report-weekly'),
    path('dashboard/', views.dashboard_stats, name='report-dashboard'),
]
