# Generated by Django 5.0.2 on 2024-05-16 12:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0092_training_notifications_sent'),
    ]

    operations = [
        migrations.AddField(
            model_name='leave',
            name='last_approved_status',
            field=models.BooleanField(default=False, verbose_name='Last Approved Status'),
        ),
    ]
