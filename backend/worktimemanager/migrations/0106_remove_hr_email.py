# Generated by Django 5.0.2 on 2024-05-21 17:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0105_alter_employee_user_alter_hr_user'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='hr',
            name='email',
        ),
    ]