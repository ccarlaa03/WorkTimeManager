# Generated by Django 5.0.2 on 2024-02-20 19:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0012_remove_hr_departament'),
    ]

    operations = [
        migrations.RenameField(
            model_name='angajat',
            old_name='post',
            new_name='pozitie',
        ),
        migrations.RenameField(
            model_name='hr',
            old_name='post',
            new_name='pozitie',
        ),
    ]
