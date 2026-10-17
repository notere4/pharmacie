from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework.test import APIClient

from inventory.models import Supplier, Medicine, DeliveryNote


class DeliveryNotePermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = get_user_model().objects.create_user(
            username='admin',
            password='adminpass',
            is_staff=True,
        )
        self.storekeeper_user = get_user_model().objects.create_user(
            username='storekeeper',
            password='storepass',
        )
        storekeeper_group, _ = Group.objects.get_or_create(name='Storekeeper')
        self.storekeeper_user.groups.add(storekeeper_group)

        self.supplier = Supplier.objects.create(name='Supplier A')
        self.medicine = Medicine.objects.create(
            name='Med A',
            unit='piece',
        )
        self.delivery_note = DeliveryNote.objects.create(
            number='BL-0001',
            supplier=self.supplier,
            total_value=100,
        )

    def test_storekeeper_cannot_delete_delivery_note(self):
        self.client.force_authenticate(user=self.storekeeper_user)
        response = self.client.delete(f'/api/delivery-notes/{self.delivery_note.id}/')
        self.assertEqual(response.status_code, 403)

    def test_admin_can_delete_delivery_note(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(f'/api/delivery-notes/{self.delivery_note.id}/')
        self.assertEqual(response.status_code, 204)
