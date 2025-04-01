from .models import Block, Client, Technician


def find_available_technicians(
    client: Client,
    day: int,
    block: Block,
) -> list[Technician]:
    """
    filter out technicians who:
    - don't meet the clients skill and language requirements
    - are not available on the given day and block
    - are already booked on the given day and block
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

    # filter out technicians who are not available on the given day and block
    qs = qs.filter(
        availabilities__day=day,
        availabilities__start_time__lte=block.start_time,
        availabilities__end_time__gte=block.end_time,
    )

    # filter out technicians who are already booked on the given day and block
    for tech in qs:
        appointments = tech.appointments.filter(day=day)

        if appointments.filter(
            start_time__lt=block.end_time, end_time__gt=block.start_time
        ).exists():
            qs = qs.exclude(pk=tech.pk)

    return qs.distinct()


def get_warnings(client: Client, tech: Technician, day: int, block: Block) -> list[str]:
    warnings = []

    # check if technician meets the client's skill and language requirements
    if tech.skill_level < client.req_skill_level:
        warnings.append(f"{tech} does not meet the client's skill level requirement")

    if client.req_spanish_speaking and not tech.spanish_speaking:
        warnings.append(f"{tech} does not speak Spanish")

    # check if the technician is available on the given day and block
    if not tech.availabilities.filter(
        day=day,
        start_time__lte=block.start_time,
        end_time__gte=block.end_time,
    ).exists():
        warnings.append(f"{tech} is not available on {day} at {block}")

    # check if the technician is maxed out on appointments for the week
    if tech.is_maxed_on_sessions:
        warnings.append(f"{tech} is maxed out on appointments for the week")

    return warnings
