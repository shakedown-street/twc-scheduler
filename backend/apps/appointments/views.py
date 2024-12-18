from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .matcher import find_available_technicians
from .models import Appointment, Availability, Block, Client, Technician
from .serializers import (
    AppointmentSerializer,
    AvailabilitySerializer,
    BlockSerialzier,
    ClientSerializer,
    TechnicianSerializer,
)


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer


class AvailabilityViewSet(viewsets.ModelViewSet):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer


class BlockViewSet(viewsets.ModelViewSet):
    queryset = Block.objects.all()
    serializer_class = BlockSerialzier


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

    @action(detail=True, methods=["get"])
    def available_techs(self, request, pk=None):
        client = self.get_object()
        day = request.query_params.get("day")
        block = request.query_params.get("block")

        available_technicians = find_available_technicians(client, day, block)
        serializer = TechnicianSerializer(
            available_technicians,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)


class TechnicianViewSet(viewsets.ModelViewSet):
    queryset = Technician.objects.all()
    serializer_class = TechnicianSerializer
