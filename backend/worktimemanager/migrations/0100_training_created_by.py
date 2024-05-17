# Generated by Django 5.0.2 on 2024-05-17 13:05

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0099_remove_training_created_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='training',
            name='created_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_trainings', to=settings.AUTH_USER_MODEL),
        ),
    ]
