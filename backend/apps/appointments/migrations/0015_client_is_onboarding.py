# Generated by Django 4.2 on 2025-04-07 22:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0014_availability_in_clinic_availability_notes"),
    ]

    operations = [
        migrations.AddField(
            model_name="client",
            name="is_onboarding",
            field=models.BooleanField(default=False),
        ),
    ]
