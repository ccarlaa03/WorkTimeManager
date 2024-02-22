from django.db import models
from django.contrib.auth.models import User

class User(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    ROLE_CHOICES = (
        ('hr', 'HR'),
        ('angajat', 'Angajat'),
    )
    role = models.CharField(max_length=7, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)


class HR(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nume = models.CharField(max_length=100)
    pozitie = models.CharField(max_length=100)
    departament = models.CharField(max_length=100) 
    data_angajarii = models.DateField()

class Angajat(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nume = models.CharField(max_length=100)
    pozitie = models.CharField(max_length=100)
    departament = models.CharField(max_length=100)
    data_angajarii = models.DateField()
    ore_lucrate = models.IntegerField(default=0)  
    zile_libere = models.IntegerField(default=0)


    def __str__(self):
        return self.user.email