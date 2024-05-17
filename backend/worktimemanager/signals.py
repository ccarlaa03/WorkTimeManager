from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group
from .models import User, Visitor, Leave, WorkSchedule,Training,Notification, Fe

@receiver(post_save, sender=User)
def assign_user_to_group(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'HR':
            hr_group, _ = Group.objects.get_or_create(name='Permisiuni HR')
            instance.groups.add(hr_group)
        elif instance.role == 'Owner':
            owner_group, _ = Group.objects.get_or_create(name='Permisiuni Owner')
            instance.groups.add(owner_group)
        elif instance.role == 'Employee':
            employee_group, _ = Group.objects.get_or_create(name='Permisiuni Employee')
            instance.groups.add(employee_group)
        elif instance.role == 'visitor': 

            pass  

