from rest_framework import serializers

from .models import Appointment, Availability, Block, Client, Technician


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")

        data["technician_color"] = instance.technician.color

        return data


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = "__all__"


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

        if request and request.query_params.get("expand_appointments"):
            data["appointments"] = AppointmentSerializer(
                instance.appointment_set,
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


class TechnicianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Technician
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")

        if request and request.query_params.get("expand_availabilities"):
            data["availabilities"] = AvailabilitySerializer(
                instance.availabilities,
                many=True,
                context=self.context,
            ).data

        return data
