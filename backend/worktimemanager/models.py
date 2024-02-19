from django.db import models

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
    department = models.CharField(max_length=100)


class Angajat(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    pozitie = models.CharField(max_length=100)
    data_angajarii = models.DateField()


    def __str__(self):
        return self.user.email