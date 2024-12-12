from django.contrib.auth import get_user_model
from django.db import models

from schedule_builder.mixins import TimestampMixin, UUIDPrimaryKeyMixin

User = get_user_model()


class UserSubscription(UUIDPrimaryKeyMixin, TimestampMixin):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )
    customer_id = models.CharField(max_length=255)
    subscription_id = models.CharField(max_length=255)
    subscription_status = models.CharField(max_length=255)
    product_id = models.CharField(max_length=255)

    class Meta:
        ordering = (
            "user",
            "-created_at",
        )

    def __str__(self):
        return (
            f"{self.user.email} - {self.subscription_id} - {self.subscription_status}"
        )
