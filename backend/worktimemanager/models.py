from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
import logging
from django.core.validators import RegexValidator
from django.db.models import Sum
from datetime import timedelta

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

class WorkSchedule(models.Model):
    user = models.ForeignKey(Employee, on_delete=models.CASCADE, db_column='user_id', related_name='work_schedules')
    start_time = models.TimeField()
    end_time = models.TimeField()
    date = models.DateField()
    overtime_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)  

    def __str__(self):
        employee_name = self.user.name if self.user else "Unknown Employee"
        department = self.user.department if self.user else "Unknown Department"
        return f"{employee_name} - {department} - {self.date}"
    
class FeedbackForm(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_feedback_forms')
    HR_REVIEW_STATUS_CHOICES = [
    ('pending', 'În așteptare'),
    ('reviewed', 'Revizuit'),
    ('action_required', 'Acțiune necesară'),]
    hr_review_status = models.CharField(
        max_length=50,
        choices=HR_REVIEW_STATUS_CHOICES,
        default='pending',
        verbose_name='Status revizuire HR'
    )
    def __str__(self):
        return self.title
    def get_hr_review_status(self):
        return dict(FeedbackForm.HR_REVIEW_STATUS_CHOICES)[self.hr_review_status]
class FeedbackQuestion(models.Model):
    form = models.ForeignKey(FeedbackForm, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    RESPONSE_TYPE_CHOICES = [
        ('text', 'Text'),
        ('rating', 'Rating'),
        ('multiple_choice', 'Multiple Choice'),
    ]
    order = models.IntegerField(help_text="Ordinea de afișare a întrebărilor")
    response_type = models.CharField(
    max_length=50,
    choices=RESPONSE_TYPE_CHOICES,
    default='text' 
)
    importance = models.IntegerField(default=1, help_text="Importanț")
    rating_scale = models.IntegerField(null=True, blank=True, help_text="Scara de rating, de exemplu, 1-5")
    def __str__(self):
        return f"Question {self.order}: {self.text}"
    
class EmployeeFeedback(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='feedbacks')
    form = models.ForeignKey(FeedbackForm, on_delete=models.CASCADE, related_name='feedback_responses')
    date_completed = models.DateTimeField(auto_now_add=True,blank=True, null=True)
    additional_comments = models.TextField(blank=True, null=True)
    total_score = models.IntegerField(default=0, help_text="Scorul total pentru acest feedback")

    def calculate_total_score(self):
        total = self.feedback_responses.aggregate(score_sum=Sum('score')).get('score_sum') or 0
        self.total_score = total
        self.save()
    @property
    def employee_department(self):
        return self.employee.department
    def __str__(self):
        return f"Feedback from {self.employee.name} for form {self.form.title}"
    
class FeedbackResponseOption(models.Model):
    question = models.ForeignKey(FeedbackQuestion, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    score = models.IntegerField() 

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.text} ({self.score} puncte)"



class FeedbackResponse(models.Model):
    feedback = models.ForeignKey(EmployeeFeedback, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(FeedbackQuestion, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(FeedbackResponseOption, on_delete=models.CASCADE, null=True, blank=True)
    response = models.TextField(blank=True, null=True)
    score = models.IntegerField(default=0)

    def __str__(self):
        return f"Response to {self.question.text} by {self.feedback.employee.name}"


class LeaveType(models.TextChoices):
    ANNUAL = 'AN', _('Concediu Anual')
    SICK = 'SI', _('Concediu Medical')
    UNPAID = 'UP', _('Concediu Fără Plată')
    MATERNITY = 'MA', _('Concediu Maternitate')
    PATERNITY = 'PA', _('Concediu Paternitate')
    STUDY = 'ST', _('Concediu de Studii')
class LeaveStatus(models.TextChoices):
    ACCEPTED = 'AC', _('Acceptat')
    REFUSED = 'RE', _('Refuzat')
    PENDING = 'PE', _('În așteptare')
    
class Leave(models.Model):
    user = models.ForeignKey(Employee, on_delete=models.CASCADE, db_column='user_id', related_name='leaves')
    start_date = models.DateField()
    end_date = models.DateField()
    is_leave = models.BooleanField(default=False, verbose_name=_('Is on Leave'))
    leave_type = models.CharField(max_length=2, choices=LeaveType.choices, null=True, blank=True, verbose_name=_('Type of Leave'))
    leave_description = models.TextField(null=True, blank=True, verbose_name=_('Leave Description'))
    is_approved = models.BooleanField(default=False, verbose_name=_('Leave Approved'))
    status = models.CharField(max_length=2, choices=LeaveStatus.choices, default=LeaveStatus.PENDING, verbose_name=_('Leave Status'))

    def __str__(self):
        employee_name = self.user.name if self.user else "Unknown Employee"
        department = self.user.department if self.user else "Unknown Department"
        return f"{employee_name} - {department} - Leave from {self.start_date} to {self.end_date} - Status: {self.get_status_display()}"
    
class Training(models.Model):
    employee = models.ManyToManyField('Employee', related_name='trainings', blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateField()
    status = models.CharField(
        max_length=50,
        choices=[
            ('planned', 'Planificat'),
            ('in_progress', 'În progres'),
            ('completed', 'Completat'),
            ('canceled', 'Anulat'),
        ],
        default='planned'
    )
    duration_days = models.PositiveIntegerField(default=1) 
    capacity = models.PositiveIntegerField(default=0)
    enrollment_deadline = models.DateField(null=True, blank=True)

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
