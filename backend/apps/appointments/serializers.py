from django.db import transaction
from rest_framework import serializers

from .models import (
    Appointment,
    Availability,
    Block,
    Client,
    Schedule,
    Technician,
    TherapyAppointment,
)


class ScheduleSerializer(serializers.ModelSerializer):
    copy_from_current = serializers.BooleanField(
        write_only=True,
        required=False,
        default=False,
    )

    class Meta:
        model = Schedule
        fields = "__all__"

    def create(self, validated_data):
        with transaction.atomic():
            copy = validated_data.pop("copy_from_current", False)

            schedule = super().create(validated_data)

            if copy:
                current_availabilities = Availability.objects.filter(schedule=None)
                current_appointments = Appointment.objects.filter(schedule=None)
                current_therapy_appointments = TherapyAppointment.objects.filter(
                    schedule=None
                )

                new_availabilities = []
                for availability in current_availabilities:
                    availability.pk = None
                    availability.schedule = schedule
                    new_availabilities.append(availability)

                new_appointments = []
                for appointment in current_appointments:
                    appointment.pk = None
                    appointment.schedule = schedule
                    new_appointments.append(appointment)

                new_therapy_appointments = []
                for therapy_appointment in current_therapy_appointments:
                    therapy_appointment.pk = None
                    therapy_appointment.schedule = schedule
                    new_therapy_appointments.append(therapy_appointment)

                Availability.objects.bulk_create(new_availabilities)
                Appointment.objects.bulk_create(new_appointments)
                TherapyAppointment.objects.bulk_create(new_therapy_appointments)

            return schedule


class ClientBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"


class TechnicianBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Technician
        fields = "__all__"


class AppointmentSerializer(serializers.ModelSerializer):
    repeats = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=True,
        required=False,
    )

    class Meta:
        model = Appointment
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["duration"] = instance.duration
        data["client"] = ClientBasicSerializer(
            instance.client, context=self.context
        ).data
        data["technician"] = TechnicianBasicSerializer(
            instance.technician, context=self.context
        ).data

        return data

    def validate_repeats(self, value):
        if not all(0 <= day <= 6 for day in value):
            raise serializers.ValidationError("Repeats must contain valid days (0-6).")
        return value

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["schedule"] = request.schedule

        repeats = validated_data.pop("repeats", None)
        created = []

        instance = super().create(validated_data)
        created.append(instance)

        if repeats is not None:
            for repeat_day in repeats:
                repeat_data = validated_data.copy()
                repeat_data["day"] = repeat_day
                repeat_instance = super().create(repeat_data)
                created.append(repeat_instance)

        return created


class TherapyAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TherapyAppointment
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["therapy_type_display"] = instance.get_therapy_type_display()

        return data

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["schedule"] = request.schedule

        return super().create(validated_data)


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = "__all__"
        read_only_fields = [
            "content_type",
            "object_id",
        ]

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["schedule"] = request.schedule

        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["duration"] = instance.duration

        return data


class BlockSerialzier(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = "__all__"


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")

        if request and request.query_params.get("expand_properties"):
            data["computed_properties"] = {
                "total_hours_available": instance.total_hours_available(
                    request.schedule
                ),
                "total_hours": instance.total_hours(request.schedule),
                "total_hours_by_day": instance.total_hours_by_day(request.schedule),
                "is_maxed_on_sessions": instance.is_maxed_on_sessions(request.schedule),
            }

        if request and request.query_params.get("expand_appointments"):
            data["appointments"] = AppointmentSerializer(
                instance.appointments.filter(schedule=request.schedule),
                many=True,
                context=self.context,
            ).data
            data["therapy_appointments"] = TherapyAppointmentSerializer(
                instance.therapy_appointments.filter(schedule=request.schedule),
                many=True,
                context=self.context,
            ).data

        if request and request.query_params.get("expand_availabilities"):
            data["availabilities"] = AvailabilitySerializer(
                instance.availabilities.filter(schedule=request.schedule),
                many=True,
                context=self.context,
            ).data

        if request and request.query_params.get("expand_current_technicians"):
            # Serialize current technicians from appointments
            current_technician_ids = instance.appointments.filter(
                schedule=request.schedule,
            ).values_list(
                "technician__id",
                flat=True,
            )
            current_technicians_qs = Technician.objects.filter(
                id__in=current_technician_ids,
            ).distinct()
            data["current_technicians"] = TechnicianBasicSerializer(
                current_technicians_qs,
                many=True,
                context=self.context,
            ).data

        # Serialize past technicians
        data["past_technicians"] = TechnicianBasicSerializer(
            instance.past_technicians.all(),
            many=True,
            context=self.context,
        ).data

        return data


class TechnicianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Technician
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")

        if request and request.query_params.get("expand_properties"):
            data["computed_properties"] = {
                "total_hours_available": instance.total_hours_available(
                    request.schedule
                ),
                "total_hours": instance.total_hours(request.schedule),
                "total_hours_by_day": instance.total_hours_by_day(request.schedule),
                "is_maxed_on_sessions": instance.is_maxed_on_sessions(request.schedule),
            }

        if request and request.query_params.get("expand_appointments"):
            data["appointments"] = AppointmentSerializer(
                instance.appointments.filter(schedule=request.schedule),
                many=True,
                context=self.context,
            ).data

        if request and request.query_params.get("expand_availabilities"):
            data["availabilities"] = AvailabilitySerializer(
                instance.availabilities.filter(schedule=request.schedule),
                many=True,
                context=self.context,
            ).data

        return data
