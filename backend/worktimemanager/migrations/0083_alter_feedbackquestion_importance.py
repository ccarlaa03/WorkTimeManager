# Generated by Django 5.0.2 on 2024-05-12 10:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0082_leave_duration'),
    ]

    operations = [
        migrations.AlterField(
            model_name='feedbackquestion',
            name='importance',
            field=models.IntegerField(default=1, help_text='Importanță'),
        ),
    ]