from datetime import datetime

from django.db.models import Q

from .models import Appointment, Block, Client, Technician


def find_available_technicians(
    client: Client,
    day: int,
    start_time: str,
    end_time: str,
    instance: Appointment | None = None,
) -> list[Technician]:
    """
    Filter out technicians who:
    - don't meet the clients skill and language requirements
    - are not available on the given day and time
    - are already booked on the given day and time

    NOTE: If an appointment is passed in, it will always return the technician
    associated with that appointment, even if they're filtered out by the
    above criteria.
    This is done to allow the user to update the appointment without having to
    reselect the technician.
    """

    # filter out technicians who don't meet the client's skill and language
    # requirements
    qs = Technician.objects.prefetch_related("appointments", "availabilities").filter(
        skill_level__gte=client.req_skill_level
    )
    if client.req_spanish_speaking:
        qs = qs.filter(spanish_speaking=True)

    # filter out technicians who are maxed out on appointments for the week
    for tech in qs:
        if tech.is_maxed_on_sessions:
            qs = qs.exclude(pk=tech.pk)

    # filter out technicians who are not available on the given day and time
    qs = qs.filter(
        availabilities__day=day,
        availabilities__start_time__lte=start_time,
        availabilities__end_time__gte=end_time,
        availabilities__is_sub=False,
    )

    # filter out technicians who are already booked on the given day and time
    for tech in qs:
        appointments = tech.appointments.filter(day=day)

        if appointments.filter(
            start_time__lt=end_time, end_time__gt=start_time
        ).exists():
            qs = qs.exclude(pk=tech.pk)

    # Add the existing appointment technician to the queryset
    if instance:
        qs = qs | Technician.objects.filter(pk=instance.technician.pk)

    return qs.distinct()


def find_repeatable_appointment_days(
    client: Client,
    tech: Technician,
    day: int,
    start_time: str,
    end_time: str,
) -> list[int]:
    """
    Return an array of days (int) that the given technician
    is able to repeat this appointment.
    """
    days = []

    for i in range(5):
        # skip today
        if i == day:
            continue

        # skip if the client is not available on the given day
        if not client.availabilities.filter(
            day=i,
            start_time__lte=start_time,
            end_time__gte=end_time,
        ).exists():
            continue

        # add the day to the list if the technician is still a good fit
        if tech in find_available_technicians(
            client,
            i,
            start_time,
            end_time,
        ):
            days.append(i)

    return days


def get_appointment_warnings(
    client: Client,
    tech: Technician,
    day: int,
    start_time: str,
    end_time: str,
    instance: Appointment | None = None,
) -> list[str]:
    warnings = []

    # Parse string times into datetime.time objects
    day_int = int(day)
    parsed_start_time = datetime.strptime(start_time, "%H:%M:%S").time()
    parsed_end_time = datetime.strptime(end_time, "%H:%M:%S").time()
    start_as_datetime = datetime.combine(datetime.today(), parsed_start_time)
    end_as_datetime = datetime.combine(datetime.today(), parsed_end_time)
    new_appt_seconds = (end_as_datetime - start_as_datetime).total_seconds()

    day_display = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
    ]

    # check if the client or technician are manually maxed out
    if client.is_manually_maxed_out:
        warnings.append(f"{client} is maxed out on sessions")

    if tech.is_manually_maxed_out:
        warnings.append(f"{tech} is maxed out on sessions")

    # check if this appointment will exceed the client's prescribed hours
    if client.prescribed_hours >= 0:
        total_hours = client.total_hours
        if instance:
            # subtract the existing appointment time from the total hours
            existing_start_as_datetime = datetime.combine(
                datetime.today(), instance.start_time
            )
            existing_end_as_datetime = datetime.combine(
                datetime.today(), instance.end_time
            )
            total_hours -= (
                existing_end_as_datetime - existing_start_as_datetime
            ).total_seconds() / 3600

        total_with_appointment = total_hours + (new_appt_seconds / 3600)
        exceeds_by = total_with_appointment - client.prescribed_hours

        if exceeds_by > 0:
            warnings.append(
                f"{client}'s prescribed hours will be exceeded by {exceeds_by:.2f} hours"
            )

    # check if this appointment will exceed the technician's requested hours
    if tech.requested_hours >= 0:
        total_hours = tech.total_hours
        if instance:
            # subtract the existing appointment time from the total hours
            existing_start_as_datetime = datetime.combine(
                datetime.today(), instance.start_time
            )
            existing_end_as_datetime = datetime.combine(
                datetime.today(), instance.end_time
            )
            total_hours -= (
                existing_end_as_datetime - existing_start_as_datetime
            ).total_seconds() / 3600

        total_with_appointment = total_hours + (new_appt_seconds / 3600)
        exceeds_by = total_with_appointment - tech.requested_hours

        if exceeds_by > 0:
            warnings.append(
                f"{tech}'s requested hours will be exceeded by {exceeds_by:.2f} hours"
            )

    # check if this appointment will exceed the technician's max hours per day
    if tech.max_hours_per_day >= 0:
        total_hours_today = tech.total_hours_by_day[day_int]
        if instance:
            # subtract the existing appointment time from the total hours
            existing_start_as_datetime = datetime.combine(
                datetime.today(), instance.start_time
            )
            existing_end_as_datetime = datetime.combine(
                datetime.today(), instance.end_time
            )
            total_hours_today -= (
                existing_end_as_datetime - existing_start_as_datetime
            ).total_seconds() / 3600
        total_with_appointment = total_hours_today + (new_appt_seconds / 3600)
        exceeds_by = total_with_appointment - tech.max_hours_per_day
        if exceeds_by > 0:
            warnings.append(
                f"{tech}'s max hours per day will be exceeded by {exceeds_by:.2f} hours"
            )

    # check if the technician meets the client's skill requirements
    if tech.skill_level < client.req_skill_level:
        warnings.append(
            f"{tech} does not meet {client}'s skill level requirement ({client.req_skill_level})"
        )

    # check if the technician meets the client's language requirements
    if client.req_spanish_speaking and not tech.spanish_speaking:
        warnings.append(f"{tech} does not speak Spanish")

    # check if the client is available
    if not client.availabilities.filter(
        day=day,
        start_time__lte=start_time,
        end_time__gte=end_time,
    ).exists():
        warnings.append(
            f"{client} is not available on {day_display[day_int]} during this time"
        )

    # check if the technician is available
    if not tech.availabilities.filter(
        day=day,
        start_time__lte=start_time,
        end_time__gte=end_time,
        is_sub=False,
    ).exists():
        warnings.append(
            f"{tech} is not available on {day_display[day_int]} during this time"
        )

    # check if the client is already booked
    client_appointments = client.appointments.filter(
        day=day,
        start_time__lt=end_time,
        end_time__gt=start_time,
    )
    if instance:
        client_appointments = client_appointments.exclude(pk=instance.pk)
    if client_appointments.exists():
        warnings.append(
            f"{client} is already booked on {day_display[day_int]} during this time"
        )

    # check if the technician is already booked
    tech_appointments = tech.appointments.filter(
        day=day,
        start_time__lt=end_time,
        end_time__gt=start_time,
    )
    if instance:
        tech_appointments = tech_appointments.exclude(pk=instance.pk)
    if tech_appointments.exists():
        warnings.append(
            f"{tech} is already booked on {day_display[day_int]} during this time"
        )

    # check if this appointment will create a split block for the client or the technician
    # NOTE: This assumes that there are only 3 blocks in the system
    block_1 = Block.objects.order_by("start_time").first()
    block_2 = Block.objects.order_by("start_time")[1]
    block_3 = Block.objects.order_by("start_time").last()

    new_appt_is_block_1 = (
        parsed_start_time >= block_1.start_time and parsed_end_time <= block_1.end_time
    )
    new_appt_is_block_3 = (
        parsed_start_time >= block_3.start_time and parsed_end_time <= block_3.end_time
    )
    client_has_block_1_appt = client.appointments.filter(
        day=day,
        start_time__gte=block_1.start_time,
        end_time__lte=block_1.end_time,
    ).exists()
    client_has_block_2_appt = client.appointments.filter(
        day=day,
        start_time__gte=block_2.start_time,
        end_time__lte=block_2.end_time,
    ).exists()
    client_has_block_3_appt = client.appointments.filter(
        day=day,
        start_time__gte=block_3.start_time,
        end_time__lte=block_3.end_time,
    ).exists()

    if new_appt_is_block_1 and client_has_block_3_appt and not client_has_block_2_appt:
        warnings.append(f"This appointment will create a split block for {client}")
    if new_appt_is_block_3 and client_has_block_1_appt and not client_has_block_2_appt:
        warnings.append(f"This appointment will create a split block for {client}")

    tech_has_block_1_appt = tech.appointments.filter(
        day=day,
        start_time__gte=block_1.start_time,
        end_time__lte=block_1.end_time,
    ).exists()
    tech_has_block_2_appt = tech.appointments.filter(
        day=day,
        start_time__gte=block_2.start_time,
        end_time__lte=block_2.end_time,
    ).exists()
    tech_has_block_3_appt = tech.appointments.filter(
        day=day,
        start_time__gte=block_3.start_time,
        end_time__lte=block_3.end_time,
    ).exists()

    if new_appt_is_block_3 and tech_has_block_1_appt and not tech_has_block_2_appt:
        warnings.append(f"This appointment will create a split block for {tech}")
    if new_appt_is_block_1 and tech_has_block_3_appt and not tech_has_block_2_appt:
        warnings.append(f"This appointment will create a split block for {tech}")

    return warnings


def find_recommended_subs(
    appointment: Appointment,
) -> list[Technician]:
    """
    Find technicians that are available to sub for the given client on the given day and time.
    """
    # filter out technicians who don't meet the client's skill and language
    # requirements
    qs = Technician.objects.prefetch_related("appointments", "availabilities").filter(
        skill_level__gte=appointment.client.req_skill_level
    )
    if appointment.client.req_spanish_speaking:
        qs = qs.filter(spanish_speaking=True)

    # filter out the technician who is already booked for this appointment
    qs = qs.exclude(pk=appointment.technician.pk)

    # filter out technicians who are not available on the given day and time
    qs = qs.filter(
        availabilities__day=appointment.day,
        availabilities__start_time__lte=appointment.start_time,
        availabilities__end_time__gte=appointment.end_time,
    )

    # filter out technicians who are already booked on the given day and time
    for tech in qs:
        if tech.appointments.filter(
            day=appointment.day,
            start_time__lt=appointment.end_time,
            end_time__gt=appointment.start_time,
        ).exists():
            qs = qs.exclude(pk=tech.pk)

    # filter out technicians who are not currently working with the client
    # and have not worked with the client before
    qs = qs.filter(
        Q(past_clients__in=[appointment.client])
        | Q(appointments__client=appointment.client)
    ).distinct()

    return qs
