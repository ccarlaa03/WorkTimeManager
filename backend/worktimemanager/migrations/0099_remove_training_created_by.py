# Generated by Django 5.0.2 on 2024-05-17 13:03

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0098_training_created_by'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='training',
            name='created_by',
        ),
    ]
