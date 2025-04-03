from rest_framework import serializers

from .models import Appointment, Availability, Block, Client, Technician


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data["technician_first_name"] = instance.technician.first_name
        data["technician_last_name"] = instance.technician.last_name
        data["technician_color"] = instance.technician.color

        return data


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = "__all__"
        read_only_fields = [
            "content_type",
            "object_id",
        ]


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

        data["total_hours"] = instance.total_hours
        data["total_hours_by_day"] = instance.total_hours_by_day
        data["is_maxed_on_sessions"] = instance.is_maxed_on_sessions

        if request and request.query_params.get("expand_appointments"):
            data["appointments"] = AppointmentSerializer(
                instance.appointments.all(),
                many=True,
                context=self.context,
            ).data

        if request and request.query_params.get("expand_availabilities"):
            data["availabilities"] = AvailabilitySerializer(
                instance.availabilities.all(),
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

        data["total_hours"] = instance.total_hours
        data["total_hours_by_day"] = instance.total_hours_by_day
        data["is_maxed_on_sessions"] = instance.is_maxed_on_sessions

        if request and request.query_params.get("expand_appointments"):
            data["appointments"] = AppointmentSerializer(
                instance.appointments,
                many=True,
                context=self.context,
            ).data

        if request and request.query_params.get("expand_availabilities"):
            data["availabilities"] = AvailabilitySerializer(
                instance.availabilities,
                many=True,
                context=self.context,
            ).data

        return data
