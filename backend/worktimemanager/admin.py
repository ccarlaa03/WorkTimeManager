from django.contrib import admin
from .models import User, Company, Owner, Employee, HR


if not admin.site.is_registered(User):
    admin.site.register(User)

if not admin.site.is_registered(Company):
    admin.site.register(Company)

if not admin.site.is_registered(Owner):
    admin.site.register(Owner)


if not admin.site.is_registered(Employee):
    admin.site.register(Employee)

if not admin.site.is_registered(HR):
    admin.site.register(HR)
