from django.contrib.auth import get_user_model
from django.urls import reverse
from faker import Faker
from knox.models import AuthToken
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.utils import create_auth_token

User = get_user_model()


class PasswordChangeTests(APITestCase):
    def setUp(self):
        self.fake = Faker()

    def test_password_change(self):
        email = self.fake.email()
        old_password = self.fake.password()
        new_password = self.fake.password()
        user = User.objects.create_user(email=email, password=old_password)

        _, old_key = create_auth_token(user)

        self.client.force_authenticate(user=user)
        data = {
            "old_password": old_password,
            "new_password1": new_password,
            "new_password2": new_password,
        }
        response = self.client.post(reverse("api-password-change"), data, format="json")
        content = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # ensure that only one token exists, and that it's not the same
        # as the old token
        user_tokens = AuthToken.objects.filter(user=user)
        self.assertEqual(user_tokens.count(), 1)
        self.assertNotEqual(content["token"], old_key)

        # ensure that the password has been changed
        user = User.objects.get(email=email)
        self.assertTrue(user.check_password(new_password))

    def test_password_change_no_token(self):
        email = self.fake.email()
        old_password = self.fake.password()
        new_password = self.fake.password()
        user = User.objects.create_user(email=email, password=old_password)

        self.client.force_authenticate(user=user)
        data = {
            "old_password": old_password,
            "new_password1": new_password,
            "new_password2": new_password,
        }
        response = self.client.post(reverse("api-password-change"), data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # ensure that a token has been created
        user_tokens = AuthToken.objects.filter(user=user)
        self.assertEqual(user_tokens.count(), 1)

        # ensure that the password has been changed
        user = User.objects.get(email=email)
        self.assertTrue(user.check_password(new_password))

    def test_password_change_incorrect_password(self):
        email = self.fake.email()
        old_password = self.fake.password()
        new_password = self.fake.password()
        user = User.objects.create_user(email=email, password=old_password)

        self.client.force_authenticate(user=user)
        data = {
            "old_password": "wrongpassword",
            "new_password1": new_password,
            "new_password2": new_password,
        }
        response = self.client.post(reverse("api-password-change"), data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # ensure that the password has not been changed
        user = User.objects.get(email=email)
        self.assertTrue(user.check_password(old_password))

    def test_password_change_mismatched_passwords(self):
        email = self.fake.email()
        old_password = self.fake.password()
        new_password = self.fake.password()
        user = User.objects.create_user(email=email, password=old_password)

        self.client.force_authenticate(user=user)
        data = {
            "old_password": old_password,
            "new_password1": new_password,
            "new_password2": "mismatched_password",
        }
        response = self.client.post(reverse("api-password-change"), data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # ensure that the password has not been changed
        user = User.objects.get(email=email)
        self.assertTrue(user.check_password(old_password))
