from .models import Block, Client, Technician


def find_available_technicians(client: Client, day: int, block: Block):
    """
    This checks:

    - Technician must be available on the given day and block
    - Technician must have the required skill level
    - If the client requires a Spanish speaking technician, the technician must be Spanish speaking

    It does __not__ check:

    - If the client is available on the given day and block
    - If there are any schedule conflicts with existing appointments
    """

    technicians = Technician.objects.filter(skill_level__gte=client.req_skill_level)
    if client.req_spanish_speaking:
        technicians = technicians.filter(spanish_speaking=True)

    available_technicians = []
    for technician in technicians:
        if technician.availabilities.filter(day=day, block=block).exists():
            available_technicians.append(technician)

    return available_technicians
