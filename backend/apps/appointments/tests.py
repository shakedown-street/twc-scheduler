from django.contrib.contenttypes.models import ContentType
from django.test import TestCase

from .matcher import find_available_technicians
from .models import Availability, Block, Client, Technician


class AvailabilityTestCase(TestCase):
    def setUp(self):
        self.block_1 = Block.objects.create(
            start_time="09:00:00",
            end_time="12:00:00",
        )
        self.block_2 = Block.objects.create(
            start_time="12:30:00",
            end_time="15:30:00",
        )
        self.client = Client.objects.create(
            first_name="Test",
            last_name="Client",
            req_skill_level=1,
            req_spanish_speaking=False,
        )
        self.technician = Technician.objects.create(
            first_name="Test",
            last_name="Technician",
            skill_level=1,
            spanish_speaking=False,
        )

        # Make client available for both blocks
        Availability.objects.create(
            content_type=ContentType.objects.get_for_model(Client),
            object_id=self.client.id,
            day=0,
            block=self.block_1,
        )
        Availability.objects.create(
            content_type=ContentType.objects.get_for_model(Client),
            object_id=self.client.id,
            day=0,
            block=self.block_2,
        )
        # Make technician only available for block 1
        Availability.objects.create(
            content_type=ContentType.objects.get_for_model(Technician),
            object_id=self.technician.id,
            day=0,
            block=self.block_1,
        )

    def test_block_availability(self):
        """
        Assert that a technician is only returned if they are available for the
        given day and block.
        """

        # Find available technicians
        block_1_technicians = find_available_technicians(self.client, 0, self.block_1)
        block_2_technicians = find_available_technicians(self.client, 0, self.block_2)

        # Assert that the technician is available for block 1
        self.assertIn(self.technician, block_1_technicians)
        self.assertEqual(len(block_1_technicians), 1)
        self.assertEqual(block_1_technicians[0], self.technician)

        # Assert that the technician is not available for block 2
        self.assertNotIn(self.technician, block_2_technicians)
        self.assertEqual(len(block_2_technicians), 0)

    def test_req_spanish_speaking(self):
        """
        Assert that an otherwise available technician is not returned if the
        client requires Spanish speaking and the technician does not speak
        Spanish.
        """

        # Technician is available
        block_1_technicians = find_available_technicians(self.client, 0, self.block_1)
        self.assertIn(self.technician, block_1_technicians)
        self.assertEqual(len(block_1_technicians), 1)

        # Make client require Spanish
        self.client.req_spanish_speaking = True
        self.client.save()

        # Technician is no longer available
        block_1_technicians = find_available_technicians(self.client, 0, self.block_1)
        self.assertNotIn(self.technician, block_1_technicians)
        self.assertEqual(len(block_1_technicians), 0)

        # Make technician Spanish speaking
        self.technician.spanish_speaking = True
        self.technician.save()

        # Technician is available again
        block_1_technicians = find_available_technicians(self.client, 0, self.block_1)
        self.assertIn(self.technician, block_1_technicians)
        self.assertEqual(len(block_1_technicians), 1)

    def test_req_skill_level(self):
        """
        Assert that an otherwise available technician is not returned if the
        client requires a skill level above the technician's skill level.
        """

        # Technician is available
        block_1_technicians = find_available_technicians(self.client, 0, self.block_1)
        self.assertIn(self.technician, block_1_technicians)
        self.assertEqual(len(block_1_technicians), 1)

        # Make client require skill level 2
        self.client.req_skill_level = 2
        self.client.save()

        # Technician is no longer available
        block_1_technicians = find_available_technicians(self.client, 0, self.block_1)
        self.assertNotIn(self.technician, block_1_technicians)
        self.assertEqual(len(block_1_technicians), 0)

        # Make technician skill level 2
        self.technician.skill_level = 2
        self.technician.save()

        # Technician is available again
        block_1_technicians = find_available_technicians(self.client, 0, self.block_1)
        self.assertIn(self.technician, block_1_technicians)
        self.assertEqual(len(block_1_technicians), 1)
