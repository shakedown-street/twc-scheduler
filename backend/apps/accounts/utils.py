from knox.models import AuthToken
from knox.settings import knox_settings


def delete_all_auth_tokens(user):
    user.auth_token_set.all().delete()


def create_auth_token(user):
    return AuthToken.objects.create(
        user=user,
        expiry=knox_settings.TOKEN_TTL,
        prefix=knox_settings.TOKEN_PREFIX,
    )
