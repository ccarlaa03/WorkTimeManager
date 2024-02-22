# Generated by Django 5.0.2 on 2024-02-20 17:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='angajat',
            old_name='pozitie',
            new_name='post',
        ),
        migrations.RenameField(
            model_name='hr',
            old_name='department',
            new_name='departament',
        ),
        migrations.AddField(
            model_name='angajat',
            name='departament',
            field=models.CharField(default='', max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='angajat',
            name='nume',
            field=models.CharField(default='', max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='angajat',
            name='ore_lucrate',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='angajat',
            name='zile_libere',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='hr',
            name='data_angajarii',
            field=models.DateField(default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='hr',
            name='nume',
            field=models.CharField(default='', max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='hr',
            name='post',
            field=models.CharField(default='', max_length=100),
            preserve_default=False,
        ),
    ]
