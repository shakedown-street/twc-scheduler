from django.contrib.contenttypes.models import ContentType
from rest_framework import exceptions, mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import (
    IsSuperUserOrReadOnly,
    IsSuperUserOrReadOnlyAuthenticated,
)

from .matcher import (
    find_available_technicians,
    find_recommended_subs,
    find_repeatable_appointment_days,
    get_appointment_warnings,
)
from .models import (
    Appointment,
    Availability,
    Block,
    Client,
    Technician,
    TherapyAppointment,
)
from .serializers import (
    AppointmentSerializer,
    AvailabilitySerializer,
    BlockSerialzier,
    ClientSerializer,
    TechnicianBasicSerializer,
    TechnicianSerializer,
    TherapyAppointmentSerializer,
)


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("client", "technician").all()
    serializer_class = AppointmentSerializer
    permission_classes = [
        IsSuperUserOrReadOnlyAuthenticated,
    ]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        created = serializer.save()
        response_data = AppointmentSerializer(
            created,
            many=True,
            context={"request": request},
        ).data
        return Response(response_data, status=201)

    @action(detail=False, methods=["get"])
    def get_warnings(self, request):
        client_id = request.query_params.get("client_id")
        tech_id = request.query_params.get("tech_id")
        day = request.query_params.get("day")
        start_time = request.query_params.get("start_time")
        end_time = request.query_params.get("end_time")
        appointment_id = request.query_params.get("appointment_id")

        if not tech_id or not client_id or not day or not start_time or not end_time:
            raise exceptions.ParseError("Missing required parameters")

        try:
            technician = Technician.objects.get(id=tech_id)
            client = Client.objects.get(id=client_id)
            appointment = None
            if appointment_id:
                appointment = Appointment.objects.get(id=appointment_id)
        except Technician.DoesNotExist:
            raise exceptions.NotFound("Technician not found")
        except Client.DoesNotExist:
            raise exceptions.NotFound("Client not found")
        except Appointment.DoesNotExist:
            raise exceptions.NotFound("Appointment not found")

        warnings = get_appointment_warnings(
            client,
            technician,
            day,
            start_time,
            end_time,
            instance=appointment,
        )
        return Response(warnings)

    @action(detail=True, methods=["get"])
    def find_recommended_subs(self, request, pk=None):
        appointment = self.get_object()
        recommended_subs = find_recommended_subs(appointment)

        serializer = TechnicianBasicSerializer(
            recommended_subs,
            many=True,
            context={"request": request},
        )

        return Response(serializer.data)


class AvailabilityViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    permission_classes = [
        IsSuperUserOrReadOnlyAuthenticated,
    ]


class BlockViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Block.objects.all()
    serializer_class = BlockSerialzier
    # NOTE: Unauthed users can see blocks
    permission_classes = [
        IsSuperUserOrReadOnly,
    ]


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.prefetch_related(
        "availabilities",
        "appointments",
        "therapy_appointments",
        "past_technicians",
    ).all()
    serializer_class = ClientSerializer
    permission_classes = [
        IsSuperUserOrReadOnlyAuthenticated,
    ]

    @action(detail=True, methods=["post"])
    def create_availability(self, request, pk=None):
        client = self.get_object()
        content_type = ContentType.objects.get_for_model(Client)
        serializer = AvailabilitySerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(
                object_id=client.id,
                content_type=content_type,
                is_sub=False,  # NOTE: is_sub does not apply to clients
            )
            return Response(serializer.data, status=201)
        raise exceptions.APIException("Failed to create availability for client.")

    @action(detail=True, methods=["get"])
    def available_techs(self, request, pk=None):
        client = self.get_object()
        day = request.query_params.get("day")
        start_time = request.query_params.get("start_time")
        end_time = request.query_params.get("end_time")
        appointment = None
        appointment_id = request.query_params.get("appointment")

        if not day or not start_time or not end_time:
            raise exceptions.ParseError("Missing required parameters")

        if appointment_id:
            try:
                appointment = Appointment.objects.get(id=appointment_id)
            except Appointment.DoesNotExist:
                raise exceptions.NotFound("Appointment not found")

        available_technicians = find_available_technicians(
            client,
            day,
            start_time,
            end_time,
            instance=appointment if appointment else None,
        )
        serializer = TechnicianBasicSerializer(
            available_technicians,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def get_repeatable_appointment_days(self, request, pk=None):
        client = self.get_object()
        tech_id = request.query_params.get("tech_id")
        day = request.query_params.get("day")
        start_time = request.query_params.get("start_time")
        end_time = request.query_params.get("end_time")

        if not tech_id or not day or not start_time or not end_time:
            raise exceptions.ParseError("Missing required parameters")

        try:
            technician = Technician.objects.get(id=tech_id)
        except Technician.DoesNotExist:
            raise exceptions.NotFound("Technician not found")

        repeatable_days = find_repeatable_appointment_days(
            client,
            technician,
            day,
            start_time,
            end_time,
        )
        return Response(repeatable_days)


class TechnicianViewSet(viewsets.ModelViewSet):
    queryset = Technician.objects.prefetch_related(
        "availabilities",
        "appointments",
    ).all()
    serializer_class = TechnicianSerializer
    permission_classes = [
        IsSuperUserOrReadOnlyAuthenticated,
    ]

    @action(detail=True, methods=["post"])
    def create_availability(self, request, pk=None):
        technician = self.get_object()
        content_type = ContentType.objects.get_for_model(Technician)
        serializer = AvailabilitySerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(
                object_id=technician.id,
                content_type=content_type,
                in_clinic=True,  # NOTE: Technicians always have to be available in clinic
            )
            return Response(serializer.data, status=201)
        raise exceptions.APIException("Failed to create availability for technician.")


class TherapyAppointmentViewSet(viewsets.ModelViewSet):
    queryset = TherapyAppointment.objects.select_related("client").all()
    serializer_class = TherapyAppointmentSerializer
    permission_classes = [
        IsSuperUserOrReadOnlyAuthenticated,
    ]
