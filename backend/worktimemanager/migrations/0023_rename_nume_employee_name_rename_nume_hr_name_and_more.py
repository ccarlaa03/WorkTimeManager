# Generated by Django 5.0.2 on 2024-02-24 16:23

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0022_remove_user_date_joined_user_role_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='employee',
            old_name='nume',
            new_name='name',
        ),
        migrations.RenameField(
            model_name='hr',
            old_name='nume',
            new_name='name',
        ),
        migrations.RemoveField(
            model_name='company',
            name='owner',
        ),
        migrations.AlterField(
            model_name='company',
            name='name',
            field=models.CharField(max_length=255, verbose_name='Numele companiei'),
        ),
        migrations.CreateModel(
            name='Owner',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('nume', models.CharField(max_length=100)),
                ('company', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='owner', to='worktimemanager.company')),
            ],
        ),
    ]