from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    role = models.CharField(max_length=10, choices=[('owner', 'Owner'), ('employee', 'Employee'), ('hr', 'HR')], default='owner')

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []


    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.email

class Company(models.Model):
    name = models.CharField(max_length=255, verbose_name="Numele Companiei")
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name='owned_company', null=True)
    address = models.TextField(verbose_name="Adresa")
    phone_number = models.CharField(max_length=20, verbose_name="Numărul de telefon")
    email = models.EmailField(verbose_name="Email")
    industry = models.CharField(max_length=255, verbose_name="Industia")
    number_of_employees = models.IntegerField(verbose_name="Numărul de angajați")
    founded_date = models.DateField(verbose_name="Data înfințării")
 
    def __str__(self):
        return self.name
    
class HR(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    nume = models.CharField(max_length=100)
    pozitie = models.CharField(max_length=100)
    departament = models.CharField(max_length=100)
    data_angajarii = models.DateField()

    def __str__(self):
        return f"HR: {self.nume}"
    
class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='employees')
    nume = models.CharField(max_length=100)
    pozitie = models.CharField(max_length=100)
    departament = models.CharField(max_length=100)
    data_angajarii = models.DateField()
    ore_lucrate = models.IntegerField(default=0)
    zile_libere = models.IntegerField(default=0)
    is_hr = models.BooleanField(default=False)

    def __str__(self):
           return f"{self.user.email} ({'HR' if self.is_hr else 'Employee'})"
    