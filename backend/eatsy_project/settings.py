import os
from pathlib import Path
from datetime import timedelta
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY    = config('SECRET_KEY', default='django-insecure-eatsy-change-me')
DEBUG         = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    # EATSY apps
    'apps.users',
    'apps.menu',
    'apps.reservations',
    'apps.orders',
    'apps.payments',
    'apps.reviews',
    'apps.reports',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF     = 'eatsy_project.urls'
WSGI_APPLICATION = 'eatsy_project.wsgi.application'
AUTH_USER_MODEL  = 'users.User'

# ── Custom email-based auth backend ───────────────────────────
AUTHENTICATION_BACKENDS = [
    'apps.users.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
]

TEMPLATES = [{
    'BACKEND':  'django.template.backends.django.DjangoTemplates',
    'DIRS':     [],
    'APP_DIRS': True,
    'OPTIONS': {
        'context_processors': [
            'django.template.context_processors.debug',
            'django.template.context_processors.request',
            'django.contrib.auth.context_processors.auth',
            'django.contrib.messages.context_processors.messages',
        ],
    },
}]

DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.mysql',
        'NAME':     config('DB_NAME',     default='eatsy_db'),
        'USER':     config('DB_USER',     default='root'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST':     config('DB_HOST',     default='127.0.0.1'),
        'PORT':     config('DB_PORT',     default='3306'),
        'OPTIONS': {
            'charset':      'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE':          20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':    timedelta(hours=2),
    'REFRESH_TOKEN_LIFETIME':   timedelta(days=30),
    'ROTATE_REFRESH_TOKENS':    True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES':        ('Bearer',),
}

CORS_ALLOWED_ORIGINS = config(
    'CORS_ORIGINS',
    default='http://localhost:4200,http://localhost:8100,capacitor://localhost,ionic://localhost'
).split(',')
CORS_ALLOW_CREDENTIALS = True

STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'static'
MEDIA_URL   = '/media/'
MEDIA_ROOT  = BASE_DIR / 'media'

LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'Africa/Douala'
USE_I18N      = True
USE_TZ        = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

SPECTACULAR_SETTINGS = {
    'TITLE':       'EATSY API',
    'DESCRIPTION': 'Restaurant management API — USJ 2025-2026',
    'VERSION':     '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}
MTN_MOMO_SUBSCRIPTION_KEY = config('MTN_MOMO_SUBSCRIPTION_KEY')
MTN_MOMO_API_USER         = config('MTN_MOMO_API_USER')
MTN_MOMO_API_KEY          = config('MTN_MOMO_API_KEY')

import dj_database_url
import os

# Railway database
if os.environ.get('DATABASE_URL'):
    DATABASES['default'] = dj_database_url.config(
        conn_max_age=600,
        ssl_require=True,
    )

# Static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# Allow Railway domain
ALLOWED_HOSTS += ['.railway.app', '.up.railway.app']

# CORS for mobile app
CORS_ALLOW_ALL_ORIGINS = True
