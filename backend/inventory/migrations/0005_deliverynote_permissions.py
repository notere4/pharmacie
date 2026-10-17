from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0004_rename_stock_medicin_5da35c_idx_stock_medicin_a69fec_idx_and_more"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="deliverynote",
            options={
                "ordering": ["-date", "-created_at"],
                "permissions": [
                    ("delete_validated_deliverynote", "Can delete validated delivery note"),
                ],
            },
        ),
    ]
