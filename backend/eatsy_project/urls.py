from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/',            admin.site.urls),
    path('api/auth/',         include('apps.users.urls')),
    path('api/menu/',         include('apps.menu.urls')),
    path('api/tables/',       include('apps.reservations.table_urls')),
    path('api/reservations/', include('apps.reservations.urls')),
    path('api/orders/',       include('apps.orders.urls')),
    path('api/payments/',     include('apps.payments.urls')),
    path('api/reviews/',      include('apps.reviews.urls')),
    path('api/reports/',      include('apps.reports.urls')),
    path('api/schema/',       SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/',         SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,  document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
