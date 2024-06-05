from django.db import models
from django.db import transaction
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
import logging
from django.core.validators import RegexValidator
from django.db.models import Sum
from django.utils import timezone
from django.conf import settings
from django.utils.timezone import now
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
from django.core.exceptions import ValidationError
from django.core.cache import cache
from django.utils.crypto import get_random_string
logger = logging.getLogger(__name__)
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)

        if self.model is None:
            raise Exception("Model is unexpectedly None")

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
        extra_fields.setdefault('is_staff', False)
        return self.create_user(email, password, **extra_fields)

    def create_employee_user(self, email=None, password=None, name='', birth_date=None, **extra_fields):
        if email is None and name:
            first_name, *last_name_parts = name.split()
            last_name = ' '.join(last_name_parts)
            email = f"{first_name.lower()}.{last_name.lower()}@company.com" if last_name else f"{first_name.lower()}@company.com"
        
        if password is None and birth_date:
            birth_date_str = birth_date.strftime('%Y%m%d')
            password = get_random_string(8) + birth_date_str  
        
        if not email:
            raise ValueError('The email must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
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
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='hr_details')
    name = models.CharField(max_length=100, null=True)
    birth_date = models.DateField(null=True, blank=True)
    department = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='HR', null=True, blank=True)
    is_hr = models.BooleanField(default=True)
    hire_date = models.DateField(null=True, blank=True)
    email = models.EmailField(max_length=100, unique=True, db_index=True, null=True)
    address = models.CharField(max_length=100, null=True)
    telephone_number = models.CharField(max_length=100, validators=[RegexValidator(r'^\+?1?\d{9,15}$')], null=True)

    def __str__(self):
        return f"{self.user.email} - {self.position}"

    @property
    def email(self):
        return self.user.email

    def clean(self):
        if not self.user:
            raise ValidationError('User field cannot be empty.')
        if not self.email:
            raise ValidationError('Email field cannot be empty.')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['user']

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='employee_details')
    name = models.CharField(max_length=100)
    birth_date = models.DateField(null=True, blank=True) 
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

    def get_total_worked_hours(self):
        return self.work_schedules.aggregate(total_hours=Sum('worked_hours'))['total_hours'] or 0
    
    @property
    def email(self):
        return self.user.email
    class Meta:
        ordering = ['user']   


class WorkSchedule(models.Model):
    user = models.ForeignKey(Employee, on_delete=models.CASCADE, db_column='user_id', related_name='work_schedules')
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    date = models.DateField()
    overtime_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    public_holidays = models.BooleanField(default=False, verbose_name="Public Holiday")
    work_history_details = models.JSONField(default=dict, verbose_name="Work history details")
    worked_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    def __str__(self):
        employee_name = self.user.name if self.user else "Unknown Employee"
        department = self.user.department if self.user else "Unknown Department"
        return f"{employee_name} - {department} - {self.date}"

    def clock_in(self):
        self.start_time = timezone.now().time()
        self.save()

    def clock_out(self):
        self.end_time = timezone.now().time()
        start_dt = timezone.datetime.combine(self.date, self.start_time)
        end_dt = timezone.datetime.combine(self.date, self.end_time)
        worked_duration = end_dt - start_dt
        worked_hours = worked_duration.total_seconds() / 3600
        self.worked_hours = worked_hours
        if worked_hours > 8:
            self.overtime_hours = worked_hours - 8
        else:
            self.overtime_hours = 0
        self.user.working_hours += worked_hours 
        self.user.save()
        self.save() 


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('leave', 'Leave Type'),
        ('work_schedule', 'Work Schedule Type'),
        ('private', 'Private Type'),
        ('feedback', 'Feedback Type'),
        ('training', 'Training Type'),
    )
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_notifications', db_index=True)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='sent_notifications', limit_choices_to={'is_hr': True}, db_index=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, db_index=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def mark_as_read(self):
        self.is_read = True
        self.save()

    def mark_as_unread(self):
        self.is_read = False
        self.save()

    def save(self, *args, **kwargs):
        if not self.id:  
            print(f"S-a salvat notificarea {now()}")
        super().save(*args, **kwargs)
    def __str__(self):
        return f'Notification from {self.sender} to {self.recipient}'

class FeedbackForm(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_feedback_forms')
    notifications_sent = models.BooleanField(default=False)
    HR_REVIEW_STATUS_CHOICES = [
        ('pending', 'În așteptare'),
        ('reviewed', 'Revizuit'),
        ('action_required', 'Acțiune necesară'),
    ]
    hr_review_status = models.CharField(max_length=50, choices=HR_REVIEW_STATUS_CHOICES, default='pending', verbose_name='Status revizuire HR')

    def __str__(self):
        return self.title

class FeedbackQuestion(models.Model):
    form = models.ForeignKey(FeedbackForm, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    RESPONSE_TYPE_CHOICES = [
        ('text', 'Text'),
        ('rating', 'Rating'),
        ('multiple_choice', 'Multiple Choice'),
    ]
    order = models.IntegerField(help_text="Ordinea de afișare a întrebărilor")
    response_type = models.CharField(max_length=50, choices=RESPONSE_TYPE_CHOICES, default='text')
    importance = models.IntegerField(default=1, help_text="Importanță")
    rating_scale = models.IntegerField(null=True, blank=True, help_text="Scara de rating, de exemplu, 1-5")

    def clean(self):
        if self.response_type == 'rating':
            if not isinstance(self.rating_scale, int) or self.rating_scale < 1:
                raise ValidationError({'rating_scale': _('Rating scale must be a positive integer for rating questions.')})
        else:
            self.rating_scale = None  


    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

class FeedbackResponseOption(models.Model):
    question = models.ForeignKey(FeedbackQuestion, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    score = models.IntegerField(default=0) 

    def __str__(self):
        return f"{self.text} ({self.score} puncte)"


class EmployeeFeedback(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='feedbacks')
    form = models.ForeignKey(FeedbackForm, on_delete=models.CASCADE, related_name='feedback_responses')
    date_completed = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    additional_comments = models.TextField(blank=True, null=True)
    total_score = models.IntegerField(null=True, default=0, help_text="Scorul total pentru acest feedback")


    def calculate_total_score(self):
        self.total_score = self.responses.aggregate(score_sum=Sum('score')).get('score_sum', 0)
        self.save(update_fields=['total_score'])

    @property
    def employee_department(self):
        return self.employee.department

    def __str__(self):
        return f"Feedback from {self.employee.name} for form {self.form.title}"

class FeedbackResponse(models.Model):
    feedback = models.ForeignKey(EmployeeFeedback, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(FeedbackQuestion, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(FeedbackResponseOption, on_delete=models.CASCADE, null=True, blank=True)
    response = models.TextField(blank=True, null=True)
    score = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        if self.selected_option:
            self.score = self.selected_option.score * self.question.importance
        super(FeedbackResponse, self).save(*args, **kwargs)
        if self.feedback:
            self.feedback.calculate_total_score()
            
@receiver(post_save, sender=FeedbackResponse)
@receiver(post_delete, sender=FeedbackResponse)
def update_feedback_score(sender, instance, **kwargs):
    if instance.feedback:
        instance.feedback.calculate_total_score()
        print(f"Updated total score for feedback {instance.feedback.id}: {instance.feedback.total_score}")

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
    is_approved = models.BooleanField(default=False)
    last_approved_status = models.BooleanField(default=False)
    status = models.CharField(max_length=2, choices=LeaveStatus.choices, default=LeaveStatus.PENDING, verbose_name=_('Leave Status'))
    leaves_history_details = models.JSONField(default=dict, verbose_name="Leaves history details")
    duration = models.DecimalField(max_digits=4, decimal_places=2, default=1.0, verbose_name=_('Duration in Days'))

    def save(self, *args, **kwargs):
        if self.pk:
            original = Leave.objects.get(pk=self.pk)
            self.last_approved_status = original.is_approved
        super(Leave, self).save(*args, **kwargs)

    def __str__(self):
        employee_name = self.user.name if self.user else "Unknown Employee"
        department = self.user.department if self.user else "Unknown Department"
        return f"{employee_name} - {department} - Leave from {self.start_date} to {self.end_date} - Status: {self.get_status_display()} - Duration: {self.duration} days"

    def is_approved_changed(self):
        return self.is_approved != self.last_approved_status
    
class Training(models.Model):
    participants = models.ManyToManyField(
        'Employee',
        related_name='trainings',
        blank=True,
        through='TrainingParticipant'  
    )
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
    notifications_sent = models.BooleanField(default=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_training')
    def __str__(self):
        return self.title

    @property
    def participant_count(self):
        return self.training_participants.count()
    
    def is_employee_registered(self, employee):
        return self.training_participants.filter(employee=employee).exists()
    
    def has_space(self):
        return self.employees.count() < self.capacity
    
    @property
    def available_seats(self):
        return max(0, self.capacity - self.participant_count)

class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    start = models.DateTimeField()
    end = models.DateTimeField()
    company = models.ForeignKey(Company, related_name='events', on_delete=models.CASCADE)

    def __str__(self):
        return self.title

class TrainingParticipant(models.Model):
    training = models.ForeignKey(Training, on_delete=models.CASCADE, related_name='training_participants')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.employee.name} - {self.training.title}"

class PrivateEvent(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    description = models.TextField()
    date = models.DateTimeField()

    def __str__(self):
        return f"Mesaj privat din data {self.date} pentru {self.user.name}"
    
@receiver(post_save, sender=Leave)
def leave_update_notification(sender, instance, **kwargs):
    if instance.is_approved_changed:
        hr_user = instance.user.company.HR.first().user if instance.user.company.HR.exists() else None
        if hr_user:
            message = f"Concediul pentru {instance.start_date.strftime('%Y-%m-%d')} - {instance.end_date.strftime('%Y-%m-%d')} a fost {'aprobat' if instance.is_approved else 'respins'}."
            Notification.objects.create(
                sender=hr_user,
                recipient=instance.user.user,
                message=message,
                notification_type='leave',
                created_at=now()
            )
            print("Notification sent:", message)
        else:
            print("No HR user found.")
    else:
        print("No change in approved status.")


@receiver(post_save, sender=Training)
def training_creation_notification(sender, instance, created, **kwargs):
    if created:
        if instance.created_by:
            logger.info(f"Training created by {instance.created_by.email}")
        else:
            logger.info("Training created without a creator specified.")

        lock_id = f"lock_training_{instance.id}"
        if cache.add(lock_id, "true", timeout=30):
            try:
                if not instance.notifications_sent:
                    send_training_notifications(instance)
            finally:
                cache.delete(lock_id)
        else:
            logger.info("Notification process is currently locked by another process.")

def send_training_notifications(instance):

    with transaction.atomic():
        logger.info(f"Sending notifications for new training form created by {instance.created_by}")
        employees = Employee.objects.all()
        if not employees.exists():
            logger.info("No employees found in the company to notify.")
            return

        message_base = f"Un nou curs, '{instance.title}', a fost programat pentru {instance.date}."
        for employee in employees:
            notification, created = Notification.objects.update_or_create(
                sender=instance.created_by,
                recipient=employee.user,
                notification_type='training',
                defaults={'message': message_base + f" {employee.name}"}
            )
            if created:
                logger.info(f"Notification created for {employee.name}")

        instance.notifications_sent = True
        instance.save(update_fields=['notifications_sent'])
        logger.info("All training notifications have been sent and marked as complete.")




@receiver(post_save, sender=WorkSchedule)
def work_schedule_notification(sender, instance, created, **kwargs):
    hr_user = instance.user.company.HR.first().user if instance.user.company.HR.exists() else None
    if hr_user:
        if created:
            message = f"Un nou program de lucru pentru {instance.date} a fost creat."
        else:
            message = f"Programul de lucru pentru {instance.date} a fost actualizat."
        
            Notification.objects.create(
                sender=hr_user,
                recipient=instance.user.user,
                message=message,
                notification_type='work_schedule', 
                created_at=now()
)

@receiver(post_save, sender=FeedbackForm)
def feedback_form_creation_notification(sender, instance, created, **kwargs):
    if created:
        lock_id = f"lock_feedbackform_{instance.id}"
        if cache.add(lock_id, "true", timeout=30): 
            try:
                if not instance.notifications_sent:
                    send_feedback_notifications(instance)
            finally:
                cache.delete(lock_id)
        else:
            logger.info("Notification process is currently locked by another process.")

def send_feedback_notifications(instance):
    with transaction.atomic():
        logger.info(f"Sending notifications for new feedback form created by {instance.created_by.email}")
        employees = Employee.objects.all()
        message_base = f"S-a creat un nou formular de feedback, '{instance.title}', vă rugăm să-l completați."
        
        for employee in employees:
            notification, created = Notification.objects.update_or_create(
                sender=instance.created_by,
                recipient=employee.user,
                notification_type='feedback',
                defaults={'message': message_base + f" {employee.name}"}
            )
            if created:
                logger.info(f"Notification created for {employee.name}")
        
        instance.notifications_sent = True
        instance.save(update_fields=['notifications_sent'])
        logger.info("All notifications have been sent and marked as complete.")


@receiver(post_save, sender=PrivateEvent)
def private_event_notification(sender, instance, created, **kwargs):
    hr_user = instance.user.company.HR.first().user if instance.user.company.HR.exists() else None
    if hr_user:
        message = f"Eveniment privat actualizat: {instance.description}"
        Notification.objects.create(
            sender=hr_user,
            recipient=instance.user,
            message=message,
            notification_type='private',
            created_at=now()
        )
