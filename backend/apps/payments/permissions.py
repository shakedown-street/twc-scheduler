from rest_framework import permissions

from apps.payments.utils import is_subscribed


class IsSubscribed(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and is_subscribed(request.user)
