# Generated by Django 5.0.2 on 2024-02-20 18:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0008_alter_angajat_data_angajarii_alter_hr_data_angajarii'),
    ]

    operations = [
        migrations.AlterField(
            model_name='angajat',
            name='data_angajarii',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='hr',
            name='data_angajarii',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
