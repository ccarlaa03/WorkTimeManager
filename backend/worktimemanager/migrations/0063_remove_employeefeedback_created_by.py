# Generated by Django 5.0.2 on 2024-04-18 11:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0062_employeefeedback_created_by'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='employeefeedback',
            name='created_by',
        ),
    ]