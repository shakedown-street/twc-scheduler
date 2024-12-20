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

    # filter out technicians who are not available on the given day and block
    qs = qs.filter(availabilities__day=day, availabilities__block=block)

    # filter out technicians who are already booked on the given day and block
    for tech in qs:
        appointments = tech.appointments.filter(day=day)

        if appointments.filter(
            start_time__lt=block.end_time, end_time__gt=block.start_time
        ).exists():
            qs = qs.exclude(pk=tech.pk)

    return qs.distinct()
