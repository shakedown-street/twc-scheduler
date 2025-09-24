from .base import *
from corsheaders.defaults import default_headers

DEBUG = True
FRONTEND_URL = "http://localhost:5173"
AUTH_PASSWORD_VALIDATORS = []
STATIC_ROOT = BASE_DIR / "server" / "dev" / "static"
MEDIA_ROOT = BASE_DIR / "server" / "dev" / "media"
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    },
}

# CSRF
# https://docs.djangoproject.com/en/4.2/ref/settings/#csrf-trusted-origins

CSRF_TRUSTED_ORIGINS = [FRONTEND_URL]


# django-cors-headers

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_HEADERS = list(default_headers) + [
    "X-Schedule-ID",
]


# djangorestframework

REST_FRAMEWORK["DEFAULT_AUTHENTICATION_CLASSES"].append(
    "rest_framework.authentication.SessionAuthentication"
)

REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"].append(
    "rest_framework.renderers.BrowsableAPIRenderer"
)


# stripe

STRIPE_CHECKOUT_RETURN_URL = (
    f"{FRONTEND_URL}/checkout/success" + "?session_id={CHECKOUT_SESSION_ID}"
)
STRIPE_BILLING_PORTAL_RETURN_URL = f"{FRONTEND_URL}/profile"
