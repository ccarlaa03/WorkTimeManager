# Generated by Django 5.0.2 on 2024-02-20 18:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0006_remove_angajat_data_angajarii_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='angajat',
            name='data_angajarii',
            field=models.DateField(blank=True, default='', null=True),
        ),
        migrations.AddField(
            model_name='hr',
            name='data_angajarii',
            field=models.DateField(blank=True, default='', null=True),
        ),
    ]
