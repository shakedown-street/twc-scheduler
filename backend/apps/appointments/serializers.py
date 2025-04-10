from rest_framework import serializers

from .models import Appointment, Availability, Block, Client, Technician


class AppointmentClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"


class AppointmentTechnicianSerializer(serializers.ModelSerializer):
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

        data["client"] = AppointmentClientSerializer(
            instance.client, context=self.context
        ).data
        data["technician"] = AppointmentTechnicianSerializer(
            instance.technician, context=self.context
        ).data

        return data

    def validate_repeats(self, value):
        if not all(0 <= day <= 6 for day in value):
            raise serializers.ValidationError("Repeats must contain valid days (0-6).")
        return value

    def create(self, validated_data):
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

        data["total_hours_available"] = instance.total_hours_available
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

        data["total_hours_available"] = instance.total_hours_available
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
