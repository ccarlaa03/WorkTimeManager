# Generated by Django 5.0.2 on 2024-04-25 13:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0071_alter_training_employee'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='training',
            name='duration',
        ),
        migrations.AddField(
            model_name='training',
            name='duration_days',
            field=models.PositiveIntegerField(default=1),
        ),
    ]
