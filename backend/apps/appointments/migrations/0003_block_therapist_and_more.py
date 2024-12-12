# Generated by Django 4.2 on 2024-12-12 17:51

import colorfield.fields
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0002_alter_availability_content_type"),
    ]

    operations = [
        migrations.CreateModel(
            name="Block",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("start_time", models.TimeField()),
                ("end_time", models.TimeField()),
            ],
            options={
                "ordering": ["start_time"],
            },
        ),
        migrations.CreateModel(
            name="Therapist",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("first_name", models.CharField(max_length=30)),
                ("last_name", models.CharField(max_length=30)),
                (
                    "color",
                    colorfield.fields.ColorField(
                        default="#000000", image_field=None, max_length=25, samples=None
                    ),
                ),
                (
                    "skill_level",
                    models.IntegerField(
                        default=1,
                        validators=[
                            django.core.validators.MinValueValidator(1),
                            django.core.validators.MaxValueValidator(3),
                        ],
                    ),
                ),
                ("spanish_speaking", models.BooleanField(default=False)),
                ("notes", models.TextField(blank=True)),
            ],
            options={
                "ordering": ["first_name", "last_name"],
                "abstract": False,
            },
        ),
        migrations.RenameField(
            model_name="client",
            old_name="req_rating",
            new_name="req_skill_level",
        ),
        migrations.CreateModel(
            name="Appointment",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "day",
                    models.IntegerField(
                        default=0,
                        validators=[
                            django.core.validators.MinValueValidator(0),
                            django.core.validators.MaxValueValidator(6),
                        ],
                    ),
                ),
                (
                    "block",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="appointments.block",
                    ),
                ),
                (
                    "client",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="appointments.client",
                    ),
                ),
                (
                    "technician",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="appointments.technician",
                    ),
                ),
            ],
            options={
                "ordering": ["client", "technician", "day", "block"],
            },
        ),
        migrations.AlterField(
            model_name="availability",
            name="block",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to="appointments.block"
            ),
        ),
    ]
