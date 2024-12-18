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
    technicians = Technician.objects.filter(skill_level__gte=client.req_skill_level)
    if client.req_spanish_speaking:
        technicians = technicians.filter(spanish_speaking=True)

    # filter out technicians who are not available on the given day and block
    available_technicians = technicians.filter(
        availabilities__day=day, availabilities__block=block
    )

    # exclude technicians who are already booked on the given day and block
    available_technicians = available_technicians.exclude(
        appointment__day=day,
        appointment__start_time__lt=block.end_time,
        appointment__end_time__gt=block.start_time,
    )

    return available_technicians.all()
