# Generated by Django 5.0.2 on 2024-05-16 20:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0096_remove_training_duration_days'),
    ]

    operations = [
        migrations.AddField(
            model_name='training',
            name='duration_days',
            field=models.PositiveIntegerField(default=1),
        ),
    ]