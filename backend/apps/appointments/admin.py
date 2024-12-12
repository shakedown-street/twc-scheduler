from django.contrib import admin

from .models import Availability, Block, Client, Technician, Therapist


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = (
        "object",
        "content_type",
        "day",
        "block",
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


@admin.register(Therapist)
class TherapistAdmin(admin.ModelAdmin):
    list_display = (
        "first_name",
        "last_name",
        "skill_level",
        "spanish_speaking",
    )
