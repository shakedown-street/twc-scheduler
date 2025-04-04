from datetime import datetime

from .models import Block, Client, Technician


def find_available_technicians(
    client: Client,
    day: int,
    start_time: str,
    end_time: str,
) -> list[Technician]:
    """
    filter out technicians who:
    - don't meet the clients skill and language requirements
    - are not available on the given day and time
    - are already booked on the given day and time
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
    )

    # filter out technicians who are already booked on the given day and time
    for tech in qs:
        appointments = tech.appointments.filter(day=day)

        if appointments.filter(
            start_time__lt=end_time, end_time__gt=start_time
        ).exists():
            qs = qs.exclude(pk=tech.pk)

    return qs.distinct()


def get_warnings(
    client: Client,
    tech: Technician,
    day: int,
    start_time: str,
    end_time: str,
) -> list[str]:
    warnings = []

    # Parse string times into datetime.time objects
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

    # check if this appointment will exceed the client's prescribed hours
    if client.prescribed_hours > 0:
        total_with_appointment = client.total_hours + (new_appt_seconds / 3600)
        exceeds_by = total_with_appointment - client.prescribed_hours

        if exceeds_by > 0:
            warnings.append(
                f"This appointment will exceed {client}'s prescribed hours by {exceeds_by:.2f} hours"
            )

    # check if this appointment will exceed the technician's requested hours
    if tech.requested_hours > 0:
        total_with_appointment = tech.total_hours + (new_appt_seconds / 3600)
        exceeds_by = total_with_appointment - tech.requested_hours

        if exceeds_by > 0:
            warnings.append(
                f"This appointment will exceed {tech}'s requested hours by {exceeds_by:.2f} hours"
            )

    # check if the technician meets the client's skill requirements
    if tech.skill_level < client.req_skill_level:
        warnings.append(f"{tech} does not meet the client's skill level requirement")

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
            f"{client} is not available on {day_display[day]} from {start_time} to {end_time}"
        )

    # check if the technician is available
    if not tech.availabilities.filter(
        day=day,
        start_time__lte=start_time,
        end_time__gte=end_time,
    ).exists():
        warnings.append(
            f"{tech} is not available on {day_display[day]} from {start_time} to {end_time}"
        )

    # check if the client is already booked
    if client.appointments.filter(
        day=day,
        start_time__lt=end_time,
        end_time__gt=start_time,
    ).exists():
        warnings.append(
            f"{client} is already booked on {day_display[day]} from {start_time} to {end_time}"
        )

    # check if the technician is already booked
    if tech.appointments.filter(
        day=day,
        start_time__lt=end_time,
        end_time__gt=start_time,
    ).exists():
        warnings.append(
            f"{tech} is already booked on {day_display[day]} from {start_time} to {end_time}"
        )

    # check if this appointment will create a split block for the client or the technician
    block_1 = Block.objects.order_by("start_time").first()
    block_3 = Block.objects.order_by("start_time").last()

    new_appt_is_block_3 = (
        parsed_start_time >= block_3.start_time and parsed_end_time <= block_3.end_time
    )
    client_has_block_1_appt = client.appointments.filter(
        day=day,
        start_time__gte=block_1.start_time,
        end_time__lte=block_1.end_time,
    ).exists()
    tech_has_block_1_appt = tech.appointments.filter(
        day=day,
        start_time__gte=block_1.start_time,
        end_time__lte=block_1.end_time,
    ).exists()

    if new_appt_is_block_3 and client_has_block_1_appt:
        warnings.append(f"This appointment will create a split block for {client}")

    if new_appt_is_block_3 and tech_has_block_1_appt:
        warnings.append(f"This appointment will create a split block for {tech}")

    return warnings
