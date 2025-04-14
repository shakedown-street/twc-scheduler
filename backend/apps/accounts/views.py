from django.contrib.auth import get_user_model, login
from knox.views import LoginView as KnoxLoginView
from rest_framework import exceptions, mixins, permissions, status, views, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from social_django.utils import psa

from apps.accounts.filters import EmailUserFilter
from apps.accounts.permissions import EmailUserPermission, IsSuperUser
from apps.accounts.serializers import (
    AuthenticationSerializer,
    # EmailUserCreateSerializer,
    EmailUserSerializer,
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetSerializer,
    ResendVerifyEmailSerializer,
    VerifyEmailSerializer,
)
from apps.accounts.utils import create_auth_token

User = get_user_model()


class EmailUserViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = User.objects.all()
    serializer_class = EmailUserSerializer
    permission_classes = (EmailUserPermission,)
    filterset_class = EmailUserFilter

    def get_queryset(self):
        queryset = self.queryset
        return queryset

    # NOTE: Signup is disabled

    # def get_serializer_class(self):
    #     if self.action == "create":
    #         return EmailUserCreateSerializer
    #     return self.serializer_class

    # def create(self, request):
    #     serializer = self.get_serializer(data=request.data)
    #     serializer.is_valid(raise_exception=True)
    #     user = serializer.save()

    #     data = EmailUserSerializer(user, context={"request": request}).data
    #     return Response(
    #         data,
    #         status=status.HTTP_201_CREATED,
    #     )

    @action(detail=False, methods=["GET"], permission_classes=[permissions.AllowAny])
    def auth(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            EmailUserSerializer(request.user, context={"request": request}).data
        )

    @action(detail=True, methods=["GET"], permission_classes=[IsSuperUser])
    def impersonate(self, request, *args, **kwargs):
        user = self.get_object()
        instance, token = create_auth_token(user)

        data = EmailUserSerializer(instance.user, context={"request": request}).data
        return Response({"user": data, "token": token})


def get_serializer_with_context(request, serializer_class):
    return serializer_class(data=request.data, context={"request": request})


class LoginView(KnoxLoginView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = get_serializer_with_context(request, AuthenticationSerializer)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return super(LoginView, self).post(request, format=None)


class PasswordChangeAPIView(views.APIView):
    serializer_class = PasswordChangeSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        serializer = get_serializer_with_context(request, self.serializer_class)
        serializer.is_valid(raise_exception=True)
        token = serializer.save()
        return Response({"token": token}, status=status.HTTP_200_OK)


class PasswordResetAPIView(views.APIView):
    serializer_class = PasswordResetSerializer

    def post(self, request, *args, **kwargs):
        serializer = get_serializer_with_context(request, self.serializer_class)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetConfirmAPIView(views.APIView):
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = get_serializer_with_context(request, self.serializer_class)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ResendVerifyEmailAPIView(views.APIView):
    serializer_class = ResendVerifyEmailSerializer

    def post(self, request, *args, **kwargs):
        serializer = get_serializer_with_context(request, self.serializer_class)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class VerifyEmailAPIView(views.APIView):
    serializer_class = VerifyEmailSerializer

    def post(self, request, *args, **kwargs):
        serializer = get_serializer_with_context(request, self.serializer_class)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@psa()
def social_auth(request, backend):
    token = request.data.get("access_token")

    try:
        user = request.backend.do_auth(token)
    except Exception as e:
        raise exceptions.APIException(str(e))

    _, token = create_auth_token(user)

    return Response(
        {
            "user": EmailUserSerializer(user, context={"request": request}).data,
            "token": token,
        }
    )
