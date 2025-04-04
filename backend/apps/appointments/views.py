from django.contrib.contenttypes.models import ContentType
from rest_framework import exceptions, mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .matcher import find_available_technicians, get_warnings
from .models import Appointment, Availability, Block, Client, Technician
from .serializers import (
    AppointmentSerializer,
    AvailabilitySerializer,
    BlockSerialzier,
    ClientSerializer,
    TechnicianSerializer,
)


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("technician").all()
    serializer_class = AppointmentSerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]


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
        permissions.IsAuthenticated,
    ]


class BlockViewSet(viewsets.ModelViewSet):
    queryset = Block.objects.all()
    serializer_class = BlockSerialzier
    permission_classes = [
        permissions.IsAuthenticated,
    ]


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_queryset(self):
        qs = super().get_queryset()
        request = self.request

        prefetch_relations = []
        if request.query_params.get("expand_appointments"):
            prefetch_relations.append("appointments")
        if request.query_params.get("expand_availabilities"):
            prefetch_relations.append("availabilities")

        if prefetch_relations:
            qs = qs.prefetch_related(*prefetch_relations)

        return qs

    @action(detail=True, methods=["post"])
    def create_availability(self, request, pk=None):
        client = self.get_object()
        content_type = ContentType.objects.get_for_model(Client)
        serializer = AvailabilitySerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(object_id=client.id, content_type=content_type)
            return Response(serializer.data, status=201)
        raise exceptions.APIException("Failed to create availability for client.")

    @action(detail=True, methods=["get"])
    def available_techs(self, request, pk=None):
        client = self.get_object()
        day = request.query_params.get("day")
        start_time = request.query_params.get("start_time")
        end_time = request.query_params.get("end_time")

        if not day or not start_time or not end_time:
            raise exceptions.ParseError("Missing required parameters")

        available_technicians = find_available_technicians(
            client, day, start_time, end_time
        )
        serializer = TechnicianSerializer(
            available_technicians,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def warning(self, request, pk=None):
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

        warnings = get_warnings(client, technician, day, start_time, end_time)
        return Response(warnings)


class TechnicianViewSet(viewsets.ModelViewSet):
    queryset = Technician.objects.all()
    serializer_class = TechnicianSerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_queryset(self):
        qs = super().get_queryset()
        request = self.request

        prefetch_relations = []
        if request.query_params.get("expand_appointments"):
            prefetch_relations.append("appointments")
        if request.query_params.get("expand_availabilities"):
            prefetch_relations.append("availabilities")

        if prefetch_relations:
            qs = qs.prefetch_related(*prefetch_relations)

        return qs

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
