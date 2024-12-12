from django.contrib.auth import get_user_model
from django.urls import reverse
from faker import Faker
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class TokenAuthTests(APITestCase):
    def setUp(self):
        self.fake = Faker()

    def test_token_auth(self):
        email = self.fake.email()
        password = self.fake.password()
        User.objects.create_user(email=email, password=password)

        data = {"username": email, "password": password}
        response = self.client.post(reverse("knox_login"), data, format="json")
        content = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(content["user"])
        user = User.objects.get(email=email)
        self.assertEqual(str(user.id), content["user"]["id"])

    def test_token_auth_not_verified(self):
        email = self.fake.email()
        password = self.fake.password()
        user = User.objects.create_user(
            email=email,
            password=password,
            is_verified=False,
        )

        self.assertFalse(user.is_verified)

        data = {"username": email, "password": password}
        response = self.client.post(reverse("knox_login"), data, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_auth_incorrect_password(self):
        email = self.fake.email()
        password = self.fake.password()
        incorrect_password = self.fake.password()
        User.objects.create_user(email=email, password=password)

        data = {"username": email, "password": incorrect_password}
        response = self.client.post(reverse("knox_login"), data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
