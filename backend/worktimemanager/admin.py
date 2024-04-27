from django.contrib import admin
from .models import User, Company, Owner, HR, Employee, WorkSchedule, FeedbackForm, EmployeeFeedback, FeedbackQuestion, Leave, Training, Event, FeedbackResponseOption, TrainingParticipant

admin.site.register(User)
admin.site.register(Company)
admin.site.register(Owner)
admin.site.register(HR)
admin.site.register(Employee)
admin.site.register(WorkSchedule)
admin.site.register(FeedbackForm)
admin.site.register(FeedbackQuestion)
admin.site.register(EmployeeFeedback)
admin.site.register(Leave)
admin.site.register(Training)
admin.site.register(Event)
admin.site.register(FeedbackResponseOption)
admin.site.register(TrainingParticipant)