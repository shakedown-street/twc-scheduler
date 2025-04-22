from colorfield.fields import ColorField
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from schedule_builder.mixins import TimestampMixin, UUIDPrimaryKeyMixin

from .utils import get_difference_in_minutes


class Technician(UUIDPrimaryKeyMixin, TimestampMixin):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    bg_color = ColorField(default="#ffffff")
    text_color = ColorField(default="#000000")
    requested_hours = models.IntegerField(default=40)
    max_hours_per_day = models.IntegerField(default=8)
    skill_level = models.IntegerField(
        default=1, validators=[MinValueValidator(1), MaxValueValidator(3)]
    )
    spanish_speaking = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    # generic relation to availabilities
    availabilities = GenericRelation("Availability")

    class Meta:
        ordering = ["first_name", "last_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def total_hours_available(self):
        total_minutes = sum(
            [
                get_difference_in_minutes(
                    availability.start_time, availability.end_time
                )
                for availability in self.availabilities.all()
            ]
        )
        return round(total_minutes / 60, 2)

    @property
    def total_hours_by_day(self):
        hours = []

        for day in range(7):
            total_minutes = sum(
                [
                    get_difference_in_minutes(
                        appointment.start_time, appointment.end_time
                    )
                    for appointment in self.appointments.filter(day=day)
                ]
            )
            hours.append(round(total_minutes / 60, 2))

        return hours

    @property
    def total_hours(self):
        total_minutes = sum(
            [
                get_difference_in_minutes(appointment.start_time, appointment.end_time)
                for appointment in self.appointments.all()
            ]
        )
        return round(total_minutes / 60, 2)

    @property
    def is_maxed_on_sessions(self):
        return self.total_hours >= self.requested_hours


class Client(UUIDPrimaryKeyMixin, TimestampMixin):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    prescribed_hours = models.IntegerField(default=0)
    req_skill_level = models.IntegerField(
        default=1, validators=[MinValueValidator(1), MaxValueValidator(3)]
    )
    req_spanish_speaking = models.BooleanField(default=False)
    eval_done = models.BooleanField(default=False)
    is_onboarding = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    sub_notes = models.TextField(
        blank=True,
        help_text="Notes regarding subbing.  E.g 'No males'",
    )
    past_technicians = models.ManyToManyField(
        Technician,
        related_name="past_clients",
        blank=True,
        help_text="Technicians that have worked with this client in the past.",
    )

    # generic relation to availabilities
    availabilities = GenericRelation("Availability")

    class Meta:
        ordering = ["first_name", "last_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def total_hours_available(self):
        total_minutes = sum(
            [
                get_difference_in_minutes(
                    availability.start_time, availability.end_time
                )
                for availability in self.availabilities.all()
            ]
        )
        return round(total_minutes / 60, 2)

    @property
    def total_hours_by_day(self):
        hours = []

        for day in range(7):
            total_minutes = sum(
                [
                    get_difference_in_minutes(
                        appointment.start_time, appointment.end_time
                    )
                    for appointment in self.appointments.filter(day=day)
                ]
            )
            hours.append(round(total_minutes / 60, 2))

        return hours

    @property
    def total_hours(self):
        total_minutes = sum(
            [
                get_difference_in_minutes(appointment.start_time, appointment.end_time)
                for appointment in self.appointments.all()
            ]
        )
        return round(total_minutes / 60, 2)

    @property
    def is_maxed_on_sessions(self):
        return self.total_hours >= self.prescribed_hours


class Block(models.Model):
    color = ColorField(default="#000000")
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ["start_time"]

    def __str__(self):
        return f"{self.start_time} - {self.end_time}"


class Availability(UUIDPrimaryKeyMixin, TimestampMixin):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    object = GenericForeignKey("content_type", "object_id")
    day = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(6)]
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_sub = models.BooleanField(
        default=False,
        help_text="Only applies to technicians. "
        "Indicates that this is not a regular availability, but that the technician "
        "is available to sub for another technician during this time.",
    )
    in_clinic = models.BooleanField(default=False)

    class Meta:
        ordering = ["content_type", "object_id", "day", "start_time"]
        verbose_name_plural = "Availabilities"
        unique_together = ["content_type", "object_id", "day", "start_time"]

    def __str__(self):
        return f"{self.object} - D{self.day} ({self.start_time}-{self.end_time})"


class Appointment(UUIDPrimaryKeyMixin, TimestampMixin):
    client = models.ForeignKey(
        Client, related_name="appointments", on_delete=models.CASCADE
    )
    technician = models.ForeignKey(
        Technician, related_name="appointments", on_delete=models.CASCADE
    )
    day = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(6)]
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    in_clinic = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["client", "technician", "day", "start_time"]
        unique_together = ["client", "day", "start_time"]

    def __str__(self):
        return f"{self.client} - {self.technician} - D{self.day} {self.start_time} - {self.end_time}"


class TherapyAppointment(UUIDPrimaryKeyMixin, TimestampMixin):
    OT = "ot"
    ST = "st"
    THERAPY_TYPE_CHOICES = (
        (OT, "Occupational Therapy"),
        (ST, "Speech Therapy"),
    )
    client = models.ForeignKey(
        Client, related_name="therapy_appointments", on_delete=models.CASCADE
    )
    therapy_type = models.CharField(
        max_length=2,
        choices=THERAPY_TYPE_CHOICES,
        default=OT,
    )
    day = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(6)]
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["client", "day", "start_time"]
        unique_together = ["client", "day", "start_time"]

    def __str__(self):
        return f"{self.client} - {self.get_therapy_type_display()} - D{self.day} {self.start_time} - {self.end_time}"

    def get_therapy_type_display(self):
        return dict(self.THERAPY_TYPE_CHOICES).get(self.therapy_type, "Unknown")
