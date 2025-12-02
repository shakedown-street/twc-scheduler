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
                    new_availabilities.append(
                        Availability(
                            content_type=availability.content_type,
                            object_id=availability.object_id,
                            day=availability.day,
                            start_time=availability.start_time,
                            end_time=availability.end_time,
                            is_sub=availability.is_sub,
                            in_clinic=availability.in_clinic,
                            schedule=schedule,
                        )
                    )

                new_appointments = []
                for appointment in current_appointments:
                    new_appointments.append(
                        Appointment(
                            client=appointment.client,
                            technician=appointment.technician,
                            day=appointment.day,
                            start_time=appointment.start_time,
                            end_time=appointment.end_time,
                            in_clinic=appointment.in_clinic,
                            is_preschool_or_adaptive=appointment.is_preschool_or_adaptive,
                            notes=appointment.notes,
                            schedule=schedule,
                        )
                    )

                new_therapy_appointments = []
                for therapy_appointment in current_therapy_appointments:
                    new_therapy_appointments.append(
                        TherapyAppointment(
                            client=therapy_appointment.client,
                            therapy_type=therapy_appointment.therapy_type,
                            day=therapy_appointment.day,
                            start_time=therapy_appointment.start_time,
                            end_time=therapy_appointment.end_time,
                            notes=therapy_appointment.notes,
                            schedule=schedule,
                        )
                    )

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
