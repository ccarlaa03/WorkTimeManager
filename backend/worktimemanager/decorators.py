from django.http import HttpResponseForbidden
from functools import wraps

def is_owner(function):
    @wraps(function)
    def wrap(request, *args, **kwargs):
        if request.user.is_authenticated and request.user.role == 'Owner':
            return function(request, *args, **kwargs)
        else:
            return HttpResponseForbidden("Nu ai permisiunea de a accesa această pagină.")
    return wrap

def is_hr(function):
    @wraps(function)
    def wrap(request, *args, **kwargs):
        if request.user.is_authenticated and request.user.role == 'HR':
            return function(request, *args, **kwargs)
        else:
            return HttpResponseForbidden("Nu ai permisiunea de a accesa această pagină.")
    return wrap

def is_employee(function):
    @wraps(function)
    def wrap(request, *args, **kwargs):
        if request.user.is_authenticated and request.user.role == 'Employee':
            return function(request, *args, **kwargs)
        else:
            return HttpResponseForbidden("Nu ai permisiunea de a accesa această pagină.")
    return wrap
