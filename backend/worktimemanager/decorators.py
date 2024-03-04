from django.http import HttpResponseForbidden
from functools import wraps


def is_owner(view_func):
    def _wrapped_view(request, *args, **kwargs):
        if not hasattr(request.user, 'owner'):
            return HttpResponseForbidden('Nu aveți permisiunea de a accesa această resursă.')
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def is_hr(view_func):
    def _wrapped_view(request, *args, **kwargs):
        if not hasattr(request.user, 'hr'):
            return HttpResponseForbidden('Nu aveți permisiunea de a accesa această resursă.')
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def is_employee(view_func):
    def _wrapped_view(request, *args, **kwargs):
        if not hasattr(request.user, 'employee'):
            return HttpResponseForbidden('Nu aveți permisiunea de a accesa această resursă.')
        return view_func(request, *args, **kwargs)
    return _wrapped_view
