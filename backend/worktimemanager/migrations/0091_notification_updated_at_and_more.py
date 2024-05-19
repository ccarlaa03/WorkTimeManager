# Generated by Django 5.0.2 on 2024-05-16 10:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0090_feedbackform_notifications_sent'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(choices=[('leave', 'Leave Type'), ('work_schedule', 'Work Schedule Type'), ('private', 'Private Type'), ('feedback', 'Feedback Type'), ('training', 'Training Type')], db_index=True, max_length=50),
        ),
    ]