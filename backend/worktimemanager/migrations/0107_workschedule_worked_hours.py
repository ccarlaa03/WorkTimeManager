# Generated by Django 5.0.2 on 2024-06-03 14:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0106_remove_hr_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='workschedule',
            name='worked_hours',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=5),
        ),
    ]
