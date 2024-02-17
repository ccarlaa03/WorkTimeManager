from django.db import models

class Angajat(models.Model):
    nume = models.CharField(max_length=100)
    prenume = models.CharField(max_length=100)
    pozitie = models.CharField(max_length=100)
    data_angajarii = models.DateField()
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.nume + " " + self.prenume
