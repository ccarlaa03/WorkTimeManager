# Generated by Django 5.0.2 on 2024-06-20 10:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0107_workschedule_worked_hours'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='employee',
            name='email',
        ),
        migrations.AlterField(
            model_name='employee',
            name='free_days',
            field=models.IntegerField(default=22),
        ),
    ]
