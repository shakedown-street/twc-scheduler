from django.contrib.auth import get_user_model
from django.urls import reverse
from faker import Faker
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class CreateUserTests(APITestCase):
    def setUp(self):
        self.fake = Faker()

    def test_create_account(self):
        email = self.fake.email()
        password = self.fake.password()
        data = {
            "email": email,
            "password1": password,
            "password2": password,
        }

        response = self.client.post(reverse("user-list"), data, format="json")
        content = response.json()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(email, content["email"])
