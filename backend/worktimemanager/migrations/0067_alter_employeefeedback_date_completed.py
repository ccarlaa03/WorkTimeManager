# Generated by Django 5.0.2 on 2024-04-18 16:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0066_remove_feedbackform_action_taken'),
    ]

    operations = [
        migrations.AlterField(
            model_name='employeefeedback',
            name='date_completed',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
    ]
