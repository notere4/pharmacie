from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

from inventory.models import (
    Category,
    Supplier,
    Service,
    Medicine,
    Stock,
    StockMovement,
    DeliveryNote,
    DeliveryNoteItem,
    Invoice,
    InvoiceItem,
)


class Command(BaseCommand):
    help = "Create default roles and assign permissions."

    def handle(self, *args, **options):
        admin_group, _ = Group.objects.get_or_create(name='Admin')
        storekeeper_group, _ = Group.objects.get_or_create(name='Storekeeper')

        all_models = [
            Category,
            Supplier,
            Service,
            Medicine,
            Stock,
            StockMovement,
            DeliveryNote,
            DeliveryNoteItem,
            Invoice,
            InvoiceItem,
        ]

        admin_permissions = Permission.objects.filter(
            content_type__in=[ContentType.objects.get_for_model(m) for m in all_models]
        )
        extra_admin_permissions = Permission.objects.filter(
            codename__in=['delete_validated_deliverynote', 'delete_validated_invoice']
        )
        admin_group.permissions.set(admin_permissions | extra_admin_permissions)

        storekeeper_permissions = Permission.objects.filter(
            content_type__in=[ContentType.objects.get_for_model(m) for m in all_models]
        ).exclude(
            codename__startswith='add_',
        ).exclude(
            codename__startswith='change_',
        ).exclude(
            codename__startswith='delete_',
        )
        storekeeper_group.permissions.set(storekeeper_permissions)

        self.stdout.write(self.style.SUCCESS('Roles setup complete.'))
