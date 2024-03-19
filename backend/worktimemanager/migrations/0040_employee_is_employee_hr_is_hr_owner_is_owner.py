# Generated by Django 5.0.2 on 2024-03-09 14:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0039_employee_shift_type_user_is_employee_user_is_hr_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee',
            name='is_employee',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='hr',
            name='is_hr',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='owner',
            name='is_owner',
            field=models.BooleanField(default=True),
        ),
    ]