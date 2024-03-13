from django.contrib import admin
from .models import User, Company, Owner, HR, Employee, WorkSchedule, Feedback, Leave, Training, Event

admin.site.register(User)
admin.site.register(Company)
admin.site.register(Owner)
admin.site.register(HR)
admin.site.register(Employee)
admin.site.register(WorkSchedule)
admin.site.register(Feedback)
admin.site.register(Leave)
admin.site.register(Training)
admin.site.register(Event)
