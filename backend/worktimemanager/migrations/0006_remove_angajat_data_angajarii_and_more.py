# Generated by Django 5.0.2 on 2024-02-20 18:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0005_alter_angajat_data_angajarii_alter_hr_data_angajarii'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='angajat',
            name='data_angajarii',
        ),
        migrations.RemoveField(
            model_name='hr',
            name='data_angajarii',
        ),
    ]