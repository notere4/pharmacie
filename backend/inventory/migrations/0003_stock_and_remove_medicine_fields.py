from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0002_deliverynote_deliverynoteitem'),
    ]

    operations = [
        migrations.CreateModel(
            name='Stock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.IntegerField()),
                ('expiration_date', models.DateField()),
                ('location', models.CharField(blank=True, max_length=150, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('medicine', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stocks', to='inventory.medicine')),
            ],
            options={
                'db_table': 'stock',
                'ordering': ['expiration_date', 'created_at'],
            },
        ),
        migrations.RemoveIndex(
            model_name='medicine',
            name='medicines_expirat_9b8013_idx',
        ),
        migrations.RemoveField(
            model_name='medicine',
            name='current_stock',
        ),
        migrations.RemoveField(
            model_name='medicine',
            name='expiration_date',
        ),
        migrations.AddIndex(
            model_name='stock',
            index=models.Index(fields=['medicine'], name='stock_medicin_5da35c_idx'),
        ),
        migrations.AddIndex(
            model_name='stock',
            index=models.Index(fields=['expiration_date'], name='stock_expirat_2d0325_idx'),
        ),
    ]
