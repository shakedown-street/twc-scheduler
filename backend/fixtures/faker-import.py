from django.db.utils import IntegrityError
from faker import Faker

fake = Faker()

blocks = Block.objects.all()
blocks_as_list = list(blocks)

Availability.objects.all().delete()
Client.objects.all().delete()
Technician.objects.all().delete()

for i in range(43):
    # Create fake client
    Client.objects.create(
        first_name=fake.first_name(),
        last_name=fake.last_name(),
        eval_done=fake.boolean(),
        is_onboarding=fake.boolean(),
        prescribed_hours=fake.random_int(min=8, max=40),
        req_skill_level=fake.random_int(min=1, max=3),
        req_spanish_speaking=fake.boolean(),
    )

for i in range(34):
    # Create fake technician
    Technician.objects.create(
        first_name=fake.first_name(),
        last_name=fake.last_name(),
        color=fake.hex_color(),
        requested_hours=fake.random_int(min=20, max=40),
        skill_level=fake.random_int(min=1, max=3),
        spanish_speaking=fake.boolean(),
    )

for client in Client.objects.all():
    # Create fake availability
    client_content_type = ContentType.objects.get_for_model(Client)
    for i in range(fake.random_int(min=1, max=15)):
        random_block = fake.random_element(elements=blocks_as_list)
        try:
            Availability.objects.create(
                content_type=client_content_type,
                object_id=client.id,
                day=fake.random_int(min=0, max=4),
                start_time=random_block.start_time,
                end_time=random_block.end_time,
                in_clinic=fake.boolean(),
            )
        except IntegrityError:
            print(
                f"Availability already exists for client {client.id} on day {random_block.start_time} to {random_block.end_time}"
            )

for technician in Technician.objects.all():
    # Create fake availability
    client_content_type = ContentType.objects.get_for_model(Technician)
    for i in range(fake.random_int(min=5, max=15)):
        random_block = fake.random_element(elements=blocks_as_list)
        try:
            Availability.objects.create(
                content_type=client_content_type,
                object_id=technician.id,
                day=fake.random_int(min=0, max=4),
                start_time=random_block.start_time,
                end_time=random_block.end_time,
                in_clinic=fake.boolean(),
            )
        except IntegrityError:
            print(
                f"Availability already exists for technician {technician.id} on day {random_block.start_time} to {random_block.end_time}"
            )
