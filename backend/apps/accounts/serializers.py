from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import (
    validate_password as django_validate_password,
)
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ObjectDoesNotExist
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.http import urlsafe_base64_decode
from rest_framework import exceptions, serializers
from rest_framework.validators import UniqueValidator

from apps.accounts.mailer import (
    send_password_changed_email,
    send_password_reset_email,
    send_verify_email,
)
from apps.accounts.utils import create_auth_token, delete_all_auth_tokens
from apps.payments.utils import is_subscribed

User = get_user_model()


def validate_password(password):
    try:
        django_validate_password(password)
    except DjangoValidationError as error:
        raise serializers.ValidationError(error.messages)


def check_password(user, password):
    if not user.check_password(password):
        raise serializers.ValidationError("Password entered is incorrect")


def validate_passwords_match(password1, password2):
    if password1 != password2:
        raise serializers.ValidationError("Passwords do not match")


def validate_uid_and_token(uid, token):
    try:
        uid = urlsafe_base64_decode(uid).decode()
        user = User.objects.get(pk=uid)
    except (ObjectDoesNotExist, UnicodeDecodeError, ValueError, ValueError):
        raise serializers.ValidationError("The provided user identifier is invalid.")

    if not default_token_generator.check_token(user, token):
        raise serializers.ValidationError(
            "The provided token is invalid or has expired."
        )
    return user


class PasswordField(serializers.CharField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("style", {})
        kwargs["style"]["input_type"] = "password"
        kwargs["trim_whitespace"] = False
        kwargs["write_only"] = True
        super().__init__(*args, **kwargs)


class EmailUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        read_only_fields = (
            "last_login",
            "is_superuser",
            "email",
            "date_joined",
            "is_active",
            "is_staff",
            "is_verified",
            "groups",
            "user_permissions",
        )
        exclude = ("password",)

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if settings.STRIPE_SECRET_KEY:
            if self.context["request"].user == instance:
                data["is_subscribed"] = is_subscribed(instance)

        return data


class EmailUserCreateSerializer(serializers.Serializer):
    email = serializers.EmailField(
        write_only=True, validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password1 = PasswordField(
        label="Password",
    )
    password2 = PasswordField(
        label="Password (again)",
    )

    def validate(self, data):
        validate_password(data["password1"])
        validate_passwords_match(data["password1"], data["password2"])
        return data

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password1"]
        return User.objects.create_user(email, password, is_verified=False)


class AuthenticationSerializer(serializers.Serializer):
    username = serializers.CharField(label="Username", write_only=True)
    password = PasswordField(label="Password")

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        user = authenticate(
            request=self.context.get("request"),
            username=username,
            password=password,
        )

        if not user:
            raise exceptions.AuthenticationFailed(
                detail="Incorrect username or password"
            )

        if not user.is_verified:
            raise exceptions.AuthenticationFailed(
                detail="Email verification is required to log in. Please check your email for the verification link."
            )

        data["user"] = user
        return data


class PasswordChangeSerializer(serializers.Serializer):
    old_password = PasswordField(
        label="Old password",
    )
    new_password1 = PasswordField(
        label="New password",
    )
    new_password2 = PasswordField(
        label="New password confirmation",
    )

    def validate(self, data):
        user = self.context["request"].user

        check_password(user, data["old_password"])
        validate_password(data["new_password1"])
        validate_passwords_match(
            password1=data["new_password1"], password2=data["new_password2"]
        )
        return data

    def save(self):
        request = self.context["request"]
        user = request.user
        new_password = self.validated_data["new_password1"]

        user.set_password(new_password)
        user.save()

        send_password_changed_email(user)
        delete_all_auth_tokens(user)
        _, new_token = create_auth_token(user)

        return new_token


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)

    def save(self):
        email = self.validated_data["email"]
        user = User.objects.get(email=email)
        send_password_reset_email(user)


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)
    new_password1 = PasswordField(
        label="New password",
    )
    new_password2 = PasswordField(
        label="New password (again)",
    )

    def validate(self, data):
        data["user"] = validate_uid_and_token(data["uid"], data["token"])
        validate_password(data["new_password1"])
        validate_passwords_match(data["new_password1"], data["new_password2"])
        return data

    def save(self):
        user = self.validated_data["user"]
        password = self.validated_data["new_password1"]

        user.set_password(password)
        user.save()

        send_password_changed_email(user)
        delete_all_auth_tokens(user)


class ResendVerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)

    def validate(self, data):
        data["user"] = User.objects.get(email=data["email"])
        if data["user"].is_verified:
            raise exceptions.ValidationError("This account has already been verified")
        return data

    def save(self):
        user = self.validated_data["user"]
        send_verify_email(user)


class VerifyEmailSerializer(serializers.Serializer):
    uid = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)

    def validate(self, data):
        data["user"] = validate_uid_and_token(data["uid"], data["token"])
        if data["user"].is_verified:
            raise exceptions.ValidationError("This account has already been verified")
        return data

    def save(self):
        user = self.validated_data["user"]
        user.is_verified = True
        user.save()
