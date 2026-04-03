from .base import *
from corsheaders.defaults import default_headers

FRONTEND_URL = f"{SITE_SCHEMA}://{SITE_DOMAIN}"

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": os.environ.get("DB_NAME", "schedule_builder"),
        "USER": os.environ.get("DB_USER", "schedule_builder"),
        "PASSWORD": os.environ.get("DB_PASS", "schedule_builder"),
        "HOST": os.environ.get("DB_HOST", "127.0.0.1"),
        "PORT": os.environ.get("DB_PORT", "5432"),
    }
}

# CSRF
# https://docs.djangoproject.com/en/4.2/ref/settings/#csrf-trusted-origins

CSRF_TRUSTED_ORIGINS = [FRONTEND_URL]


# django-cors-headers

CORS_ALLOWED_ORIGINS = [FRONTEND_URL]
CORS_ALLOW_HEADERS = list(default_headers) + [
    "X-Schedule-ID",
]
