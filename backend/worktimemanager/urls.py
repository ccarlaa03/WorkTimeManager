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
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),  
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('acasa/', views.acasa_view, name='acasa'),
    path('logout/', views.logout_view, name='logout'),
    path('owner-dashboard/', views.owner_dashboard, name='owner-dashboard'),
    path('hr-dashboard/', views.hr_dashboard, name='hr-dashboard'),
    path('employee-dashboard/', views.employee_dashboard, name='employee-dashboard'),
    path('gestionare-ang/', views.list_employees, name='gestionare-ang'),
    path('events/', views.events_view, name='events'),
    path('employees/', views.events_view, name='employees'),
    path('update-profile/<int:user_id>/', views.update_profile, name='update_profile'),
    path('create_employee/', views.create_employee_user, name='create_employee'),
    path('add-event/', views.add_event, name='add-event'),

    path('', RedirectView.as_view(url=reverse_lazy('acasa'), permanent=False)),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += [
        re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    ]



