# Generated by Django 5.0.2 on 2024-04-26 17:54

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0072_remove_training_duration_training_duration_days'),
    ]

    operations = [
        migrations.CreateModel(
            name='TrainingParticipant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('department', models.CharField(max_length=100)),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='worktimemanager.employee')),
                ('training', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='participants', to='worktimemanager.training')),
            ],
        ),
    ]