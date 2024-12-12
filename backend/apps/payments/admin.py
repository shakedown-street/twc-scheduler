from django.contrib import admin

from .models import UserSubscription


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "subscription_id",
        "subscription_status",
        "product_id",
        "created_at",
        "updated_at",
    )
    list_filter = ("subscription_status",)
