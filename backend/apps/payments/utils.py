def is_subscribed(user):
    if user.is_superuser:
        return True

    return user.subscriptions.filter(subscription_status="active").exists()
