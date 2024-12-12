from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.accounts.models import EmailUser


@admin.register(EmailUser)
class EmailUserAdmin(UserAdmin):
    ordering = ("email",)
    list_display = (
        "email",
        "first_name",
        "last_name",
        "phone",
        "is_verified",
        "is_staff",
        "is_superuser",
    )
    list_filter = (
        "is_staff",
        "is_superuser",
        "is_active",
        "groups",
    )
    search_fields = (
        "email",
        "first_name",
        "last_name",
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2"),
            },
        ),
    )
    fieldsets = (
        (
            "User Info",
            {
                "fields": (
                    "email",
                    "password",
                    ("first_name", "last_name"),
                    "phone",
                    "image",
                ),
            },
        ),
        (
            "Verification",
            {"fields": ("is_verified",)},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
    )
