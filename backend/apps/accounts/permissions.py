from rest_framework import permissions


class IsSuperUser(permissions.BasePermission):
    """
    This differs from Django's IsAdminUser in that it checks if the user is a superuser
    rather than just staff.
    """

    def has_permission(self, request, view):
        return request.user.is_superuser


class EmailUserPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.method == "POST" or request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        return request.method in permissions.SAFE_METHODS or obj == request.user
