from .base import *

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


# stripe

STRIPE_CHECKOUT_RETURN_URL = (
    f"{FRONTEND_URL}/checkout/success" + "?session_id={CHECKOUT_SESSION_ID}"
)
STRIPE_BILLING_PORTAL_RETURN_URL = f"{FRONTEND_URL}/profile"


# sentry

SENTRY_DSN = os.environ.get("SENTRY_DSN", None)
if SENTRY_DSN:
    import sentry_sdk

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )
