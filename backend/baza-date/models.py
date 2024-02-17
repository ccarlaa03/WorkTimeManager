from django.db import models
from django.conf import settings

class MyModel(models.Model):
    upload_to_path = settings.MEDIA_ROOT + '/my_uploads/'
    file = models.FileField(upload_to=upload_to_path)
class Angajat(models.Model):
    nume = models.CharField(max_length=100)
    prenume = models.CharField(max_length=100)
    pozitie = models.CharField(max_length=100)
    data_angajarii = models.DateField()
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.nume + " " + self.prenume
