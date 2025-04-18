# Generated by Django 4.2 on 2025-04-15 21:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0020_technician_max_hours_per_day_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="availability",
            name="is_sub",
            field=models.BooleanField(
                default=False,
                help_text="Only applies to technicians. Indicates that this is not a regular availability, but that the technician is available to sub for another technician during this time.",
            ),
        ),
    ]
