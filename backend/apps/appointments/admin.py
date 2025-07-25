from django.contrib import admin

from .models import (
    Appointment,
    Availability,
    Block,
    Client,
    Technician,
    TherapyAppointment,
)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        "client",
        "technician",
        "day",
        "start_time",
        "end_time",
        "in_clinic",
        "is_preschool_or_adaptive",
    )


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = (
        "object",
        "content_type",
        "day",
        "start_time",
        "end_time",
    )


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = (
        "start_time",
        "end_time",
    )


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = (
        "first_name",
        "last_name",
        "req_skill_level",
        "req_spanish_speaking",
    )


@admin.register(Technician)
class TechnicianAdmin(admin.ModelAdmin):
    list_display = (
        "first_name",
        "last_name",
        "skill_level",
        "spanish_speaking",
    )


@admin.register(TherapyAppointment)
class TherapyAppointmentAdmin(admin.ModelAdmin):
    list_display = (
        "client",
        "therapy_type",
        "day",
        "start_time",
        "end_time",
    )
