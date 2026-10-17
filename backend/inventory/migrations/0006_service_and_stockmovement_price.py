from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0005_deliverynote_permissions"),
    ]

    operations = [
        migrations.CreateModel(
            name="Service",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=255, unique=True)),
                ("etage", models.CharField(blank=True, max_length=255, null=True)),
                ("note", models.TextField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "db_table": "services",
                "ordering": ["name"],
            },
        ),
        migrations.AddField(
            model_name="stockmovement",
            name="service",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="stock_movements", to="inventory.service"),
        ),
        migrations.AddField(
            model_name="stockmovement",
            name="unit_price",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.RemoveField(
            model_name="medicine",
            name="unit_price",
        ),
    ]
