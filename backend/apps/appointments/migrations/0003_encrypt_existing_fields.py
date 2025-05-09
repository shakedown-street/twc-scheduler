# Generated by Django 4.2 on 2025-04-28 21:38

from django.db import migrations


def encrypt_existing_fields(apps, schema_editor):
    Technician = apps.get_model("appointments", "Technician")
    Client = apps.get_model("appointments", "Client")
    Appointment = apps.get_model("appointments", "Appointment")
    TherapyAppointment = apps.get_model("appointments", "TherapyAppointment")

    # Encrypt first_name, last_name and notes for Technician
    for technician in Technician.objects.all():
        technician.encrypted_first_name = technician.first_name
        technician.encrypted_last_name = technician.last_name
        technician.encrypted_notes = technician.notes
        technician.save()

    # Encrypt first_name, last_name, notes, and sub_notes for Client
    for client in Client.objects.all():
        client.encrypted_first_name = client.first_name
        client.encrypted_last_name = client.last_name
        client.encrypted_notes = client.notes
        client.encrypted_sub_notes = client.sub_notes
        client.save()

    # Encrypt notes for Appointment
    for appointment in Appointment.objects.all():
        appointment.encrypted_notes = appointment.notes
        appointment.save()

    # Encrypt notes for TherapyAppointment
    for therapy_appointment in TherapyAppointment.objects.all():
        therapy_appointment.encrypted_notes = therapy_appointment.notes
        therapy_appointment.save()


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0002_appointment_encrypted_notes_and_more"),
    ]

    operations = [
        migrations.RunPython(encrypt_existing_fields),
    ]
