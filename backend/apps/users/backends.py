from django.contrib.auth.backends import ModelBackend
from apps.users.models import User


class EmailBackend(ModelBackend):
    """
    Authenticate using email + password instead of username.
    Required because Django's default backend uses 'username'.
    """

    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            user = User.objects.get(email__iexact=email)
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        except User.DoesNotExist:
            # Run the default hasher to prevent timing attacks
            User().set_password(password)
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
