import uuid
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0006_service_and_stockmovement_price'),
    ]

    operations = [
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('number', models.CharField(max_length=50, unique=True)),
                ('date', models.DateField(default=django.utils.timezone.now)),
                ('date_start', models.DateField(blank=True, null=True)),
                ('date_end', models.DateField(blank=True, null=True)),
                ('notes', models.TextField(blank=True, null=True)),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('validated', 'Validated')], default='draft', max_length=20)),
                ('total_value', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('supplier', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='invoices', to='inventory.supplier')),
            ],
            options={
                'db_table': 'invoices',
                'ordering': ['-date', '-created_at'],
                'permissions': [('delete_validated_invoice', 'Can delete validated invoice')],
            },
        ),
        migrations.CreateModel(
            name='InvoiceItem',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('lot', models.CharField(blank=True, max_length=100, null=True)),
                ('expiration_date', models.DateField(blank=True, null=True)),
                ('quantity', models.IntegerField()),
                ('unit_price', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('line_total', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('delivery_note', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='invoice_items', to='inventory.deliverynote')),
                ('invoice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='inventory.invoice')),
                ('medicine', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='invoice_items', to='inventory.medicine')),
            ],
            options={
                'db_table': 'invoice_items',
                'ordering': ['invoice__date', 'medicine__name'],
            },
        ),
    ]
