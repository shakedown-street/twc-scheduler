from django.contrib import admin

from .models import Appointment, Availability, Block, Client, Technician


@admin.register(Appointment)
class Appointment(admin.ModelAdmin):
    list_display = (
        "client",
        "technician",
        "day",
        "start_time",
        "end_time",
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
