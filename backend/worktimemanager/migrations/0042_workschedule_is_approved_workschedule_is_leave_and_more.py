# Generated by Django 5.0.2 on 2024-03-21 21:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0041_alter_user_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='workschedule',
            name='is_approved',
            field=models.BooleanField(default=False, verbose_name='Leave Approved'),
        ),
        migrations.AddField(
            model_name='workschedule',
            name='is_leave',
            field=models.BooleanField(default=False, verbose_name='Is on Leave'),
        ),
        migrations.AddField(
            model_name='workschedule',
            name='leave_description',
            field=models.TextField(blank=True, null=True, verbose_name='Leave Description'),
        ),
        migrations.AddField(
            model_name='workschedule',
            name='leave_type',
            field=models.CharField(blank=True, choices=[('AN', 'Annual Leave'), ('SI', 'Sick Leave'), ('UP', 'Unpaid Leave'), ('MA', 'Maternity Leave'), ('PA', 'Paternity Leave'), ('ST', 'Study Leave')], max_length=2, null=True, verbose_name='Type of Leave'),
        ),
    ]
