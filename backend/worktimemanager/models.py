from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
import logging
from django.core.validators import RegexValidator

logger = logging.getLogger(__name__)
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_owner(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_owner', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)

    def create_hr_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_hr', True)
        # Asigură-te că 'company' este furnizat în extra_fields
        if 'company' not in extra_fields:
            raise ValueError(_('Company must be set for HR user'))
        user = self.create_user(email, password, **extra_fields)
        # Când creezi HR, asociază-l cu compania specificată
        HR.objects.create(user=user, company=extra_fields['company'])
        return user

    def create_employee_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_employee', True)
        # Similar cu HR, asigură-te că 'company' este furnizat
        if 'company' not in extra_fields:
            raise ValueError(_('Company must be set for Employee user'))
        user = self.create_user(email, password, **extra_fields)
        # Asociază angajatul cu compania
        Employee.objects.create(user=user, company=extra_fields['company'])
        return user
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('hr', 'HR'),
        ('employee', 'Employee'),
        ('visitor', 'Visitor'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='visitor') 
    is_hr = models.BooleanField(default=False)
    is_employee = models.BooleanField(default=False)
    is_owner = models.BooleanField(default=False)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class Company(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField(verbose_name="Adresa")
    phone_number = models.CharField(max_length=20, verbose_name="Numărul de telefon")
    email = models.EmailField(verbose_name="Email")
    industry = models.CharField(max_length=255, verbose_name="Industria")
    number_of_employees = models.IntegerField(verbose_name="Numărul de angajați")
    founded_date = models.DateField(verbose_name="Data înființării")

    def __str__(self):
        return self.name

class Owner(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    name = models.CharField(max_length=100, blank=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='owner', null=True, blank=True)
    is_owner = models.BooleanField(default=True)
    def __str__(self):
        return self.name

class HR(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, null=True)  
    department = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='hr', null=True, blank=True)
    is_hr = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.user.email} - {self.position}"
class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    hire_date = models.DateField()
    working_hours = models.IntegerField(default=0)
    free_days = models.IntegerField(default=0)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True)
    email = models.EmailField(max_length=100, unique=True, db_index=True, null=True)
    address = models.CharField(max_length=100, null=True)
    telephone_number = models.CharField(max_length=100, validators=[RegexValidator(r'^\+?1?\d{9,15}$')], null=True)
    is_employee = models.BooleanField(default=True)
    def __str__(self):
        return self.name
    def get_schedules(self):
        return self.work_schedules.all()

    def get_feedbacks(self):
        return self.feedbacks.all()

    def get_leaves(self):
        return self.leaves.all()

    def get_trainings(self):
        return self.trainings.all()
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

class LeaveType(models.TextChoices):
    ANNUAL = 'AN', _('Annual Leave')
    SICK = 'SI', _('Sick Leave')
    UNPAID = 'UP', _('Unpaid Leave')
    MATERNITY = 'MA', _('Maternity Leave')
    PATERNITY = 'PA', _('Paternity Leave')
    STUDY = 'ST', _('Study Leave')

class WorkSchedule(models.Model):
    employee = models.ForeignKey('Employee', on_delete=models.CASCADE, related_name='work_schedules')
    start_time = models.TimeField()
    end_time = models.TimeField()
    date = models.DateField()
    overtime_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)  
    shift_type = models.CharField(max_length=10, choices=(('day', 'Zi'), ('night', 'Noapte')), null=True)

    def __str__(self):
        shift = "Zi" if self.shift_type == 'Zi' else "Noapte"
        department = self.employee.department if self.employee else "Unknown Department"
        return f"{self.employee.name} - {self.date} Schedule - Schimb de {shift} - {department}"




class Feedback(models.Model):
    employee = models.ForeignKey('Employee', on_delete=models.CASCADE, related_name='feedbacks')
    created_by = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, related_name='given_feedbacks')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback for {self.employee.name} by {self.created_by.name}"


class Leave(models.Model):
    employee = models.ForeignKey('Employee', on_delete=models.CASCADE, related_name='leaves')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=255)
    is_leave = models.BooleanField(default=False, verbose_name=_('Is on Leave'))
    leave_type = models.CharField(max_length=2, choices=LeaveType.choices, null=True, blank=True, verbose_name=_('Type of Leave'))
    leave_description = models.TextField(null=True, blank=True, verbose_name=_('Leave Description'))
    is_approved = models.BooleanField(default=False, verbose_name=_('Leave Approved'))
    def __str__(self):
        return f"{self.employee.name} - Leave from {self.start_date} to {self.end_date}"


class Training(models.Model):
    employee = models.ManyToManyField('Employee', related_name='trainings')
    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateField()

    def __str__(self):
        return self.title
class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    start = models.DateTimeField()
    end = models.DateTimeField()
    company = models.ForeignKey(Company, related_name='events', on_delete=models.CASCADE)

    def __str__(self):
        return self.title
