# Generated by Django 5.0.2 on 2024-02-20 21:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0013_rename_post_angajat_pozitie_rename_post_hr_pozitie'),
    ]

    operations = [
        migrations.AddField(
            model_name='hr',
            name='departament',
            field=models.CharField(default='HR', max_length=100),
            preserve_default=False,
        ),
    ]
