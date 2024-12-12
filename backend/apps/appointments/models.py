from colorfield.fields import ColorField
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from schedule_builder.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Employee(UUIDPrimaryKeyMixin, TimestampMixin):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    color = ColorField(default="#000000")
    skill_level = models.IntegerField(
        default=1, validators=[MinValueValidator(1), MaxValueValidator(3)]
    )
    spanish_speaking = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    availabilities = GenericRelation("Availability")

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        ordering = ["first_name", "last_name"]
        abstract = True


class Technician(Employee):
    pass


class Therapist(Employee):
    pass


class Client(UUIDPrimaryKeyMixin, TimestampMixin):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    req_skill_level = models.IntegerField(
        default=1, validators=[MinValueValidator(1), MaxValueValidator(3)]
    )
    req_spanish_speaking = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    availabilities = GenericRelation("Availability")

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        ordering = ["first_name", "last_name"]


class Block(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.start_time} - {self.end_time}"

    class Meta:
        ordering = ["start_time"]


class Availability(UUIDPrimaryKeyMixin, TimestampMixin):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    object = GenericForeignKey("content_type", "object_id")
    day = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(6)]
    )
    block = models.ForeignKey(Block, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.object} - D{self.day} B{self.block}"

    class Meta:
        ordering = ["content_type", "object_id", "day", "block"]
        verbose_name_plural = "Availabilities"
        unique_together = ["content_type", "object_id", "day", "block"]


class Appointment(UUIDPrimaryKeyMixin, TimestampMixin):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    technician = models.ForeignKey(Technician, on_delete=models.CASCADE)
    day = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(6)]
    )
    block = models.ForeignKey(Block, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.client} - {self.technician} - D{self.day} B{self.block}"

    class Meta:
        ordering = ["client", "technician", "day", "block"]
