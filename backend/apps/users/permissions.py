from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """
    Only the admin user (is_admin=True) can access this endpoint.
    Used to protect all admin management endpoints.
    """
    message = 'Admin credentials required.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'is_admin', False)
        )
