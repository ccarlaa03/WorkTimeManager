# Generated by Django 5.0.2 on 2024-05-13 10:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worktimemanager', '0085_alter_employeefeedback_total_score_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='employeefeedback',
            name='total_score',
            field=models.IntegerField(default=0, help_text='Scorul total pentru acest feedback', null=True),
        ),
    ]