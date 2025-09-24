from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from knox import views as knox_views
from rest_framework import routers

from apps.accounts.views import (
    EmailUserViewSet,
    LoginView,
    PasswordChangeAPIView,
    # PasswordResetAPIView,
    # PasswordResetConfirmAPIView,
    # ResendVerifyEmailAPIView,
    # VerifyEmailAPIView,
    # social_auth,
)
from apps.appointments.views import (
    AppointmentViewSet,
    AvailabilityViewSet,
    BlockViewSet,
    ClientViewSet,
    ScheduleViewSet,
    TechnicianViewSet,
    TherapyAppointmentViewSet,
)

router = routers.DefaultRouter()
router.register(r"users", EmailUserViewSet, "user")
router.register(r"appointments", AppointmentViewSet, "appointment")
router.register(r"availabilities", AvailabilityViewSet, "availability")
router.register(r"blocks", BlockViewSet, "block")
router.register(r"clients", ClientViewSet, "client")
router.register(r"schedules", ScheduleViewSet, "schedule")
router.register(r"technicians", TechnicianViewSet, "technician")
router.register(
    r"therapy-appointments",
    TherapyAppointmentViewSet,
    "therapy-appointment",
)


# Enable Stripe API endpoints if the secret key is set

if settings.STRIPE_SECRET_KEY:
    from apps.payments.views import BillingSessionViewSet, CheckoutSessionViewSet

    router.register(
        r"checkout-sessions",
        CheckoutSessionViewSet,
        "checkout-session",
    )
    router.register(
        r"billing-sessions",
        BillingSessionViewSet,
        "billing-session",
    )

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/token-auth/", LoginView.as_view(), name="knox_login"),
    path("api/token-auth/logout/", knox_views.LogoutView.as_view(), name="knox_logout"),
    path(
        "api/token-auth/logoutall/",
        knox_views.LogoutAllView.as_view(),
        name="knox_logoutall",
    ),
    # NOTE: Social auth is disabled
    # path("api/social-auth/<backend>/", social_auth, name="api-social-auth"),
    path(
        "api/password-change/",
        PasswordChangeAPIView.as_view(),
        name="api-password-change",
    ),
    # NOTE: Password reset is disabled
    # path(
    #     "api/password-reset/", PasswordResetAPIView.as_view(), name="api-password-reset"
    # ),
    # path(
    #     "api/password-reset-confirm/",
    #     PasswordResetConfirmAPIView.as_view(),
    #     name="api-password-reset-confirm",
    # ),
    # NOTE: Signup is disabled
    # path(
    #     "api/resend-verify-email/",
    #     ResendVerifyEmailAPIView.as_view(),
    #     name="api-resend-verify-email",
    # ),
    # path("api/verify-email/", VerifyEmailAPIView.as_view(), name="api-verify-email"),
]

if settings.DEBUG:
    from django.conf.urls.static import static

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += (path("api/auth/", include("rest_framework.urls"), name="api-auth"),)


# Enable Stripe webhook endpoint if the secret key is set

if settings.STRIPE_SECRET_KEY:
    from apps.payments.views import stripe_webhook

    urlpatterns += [
        path("api/swh/", stripe_webhook, name="stripe-webhook"),
    ]
