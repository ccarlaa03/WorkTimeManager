"""
URL configuration for worktimemanager project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, reverse_lazy
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from . import views
from django.views.generic.base import RedirectView
from .views import owner_dashboard

urlpatterns = [
    path('admin/', admin.site.urls),  
    path('api/signup/', views.signup_view, name='signup'),
    path('api/login/', views.login_view, name='login'),
    path('acasa/', views.acasa_view, name='acasa'),
    path('logout/', views.user_logout, name='logout'),
    path('owner-dashboard/', owner_dashboard, name='owner-dashboard'),
    path('company-details/', views.company_details_view, name='company-details'),
    path('events/', views.events_view, name='events'),


    path('', RedirectView.as_view(url=reverse_lazy('acasa'), permanent=False)),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += [
        re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    ]



