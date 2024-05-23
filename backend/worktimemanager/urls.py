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
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('acasa/', views.acasa_view, name='acasa'),
    path('logout/', views.logout_view, name='logout'),
    path('owner-dashboard/', views.owner_dashboard, name='owner-dashboard'),
    path('hr-dashboard/', views.hr_dashboard, name='hr-dashboard'),
    path('employee-dashboard/', views.employee_dashboard, name='employee-dashboard'),
    path('employee/<int:user_id>/weekly-stats/', views.weekly_statistics, name='weekly-stats'),
    path('clock-in/<int:user_id>/', views.clock_in, name='clock-in'),
    path('clock-out/<int:user_id>/', views.clock_out, name='clock-out'),
    path('employee/<int:user_id>/current-status/', views.get_current_status, name='current-status'),
    path('update-employee-profile/<int:user_id>/', views.update_employee_profile, name='update-employee-profile'),
    path('send-notification/', views.send_notification, name='send-notification'),
    path('notifications/<int:user_id>/', views.fetch_notifications, name='fetch-notifications'),
    path('notifications/mark-read/<int:notification_id>/', views.mark_notification_as_read, name='mark-notification-as-read'),
    path('employee-profile/', views.employee_detail, name='employee-profile'), 
    path('gestionare-ang/', views.list_employees, name='gestionare-ang'),
    path('gestionare-prog/', views.workschedule_list, name='employee-workschedules'),
    path('angajat-prog/<int:user_id>/', views.employee_workschedule_list, name='angajat-prog'),
    path('employee/<int:user_id>/work-schedule/', views.get_work_schedule, name='work-schedule-by-month'),
    path('employee/<int:user_id>/work-history/<int:year>/<int:month>/', views.get_work_history_by_month, name='work-history-by-month'),
    path('employee/<int:user_id>/leaves/year/<int:year>/', views.get_leaves_by_year, name='leaves-by-year'),
    path('employee/<int:user_id>/leave-statistics/', views.get_leave_statistics, name='leave-statistics'),
    path('feedback-forms/', views.employee_feedback_forms, name='employee-feedback-forms'),
    path('feedback/check-submitted/<int:form_id>/', views.check_if_submitted, name='check-if-submitted'),
    path('feedback-history/', views.feedback_history, name='feedback-history'),
    path('employee_leaves/<int:user_id>/', views.employee_leaves_list, name='concedii'),
    path('employee/<int:user_id>/leave-history/<int:year>/', views.get_leave_history_by_year, name='leave-history-by-year'),
    path('workschedule-create/', views.workschedule_create, name='workschedule-create'),
    path('workschedules/<int:id>/', views.workschedule_retrieve, name='workschedule-retrieve'),
    path('workschedule_update/<int:id>/', views.workschedule_update, name='workschedule_update'),
    path('workschedules/<int:id>/delete/', views.workschedule_delete, name='workschedule-delete'),
    path('events/', views.events_view, name='events'),
    path('employees/', views.events_view, name='employees'),
    path('update-profile/<int:user_id>/', views.update_profile, name='update_profile'),
    path('create_employee/', views.create_employee, name='create_employee'),
    path('check_user_exists/', views.check_user_exists, name='check_user_exists'),
    path('update_employee/<int:user_id>/', views.update_employee, name='update_employee'),
    path('delete_employee/<int:user_id>/', views.delete_employee, name='delete_employee'),
    path('add-event/', views.add_event, name='add-event'),
    path('check_user_exists/', views.check_user_exists, name='check_user_exists'),
    path('leaves/', views.leave_list_create, name='leave-list-create'),
    path('leaves/<int:id>/', views.leave_detail, name='leave-detail'),
    path('gestionare-concedii/', views.leave_list, name='gestionare-concedii'),
    path('leave_delete/<int:user_id>/', views.delete_employee, name='leave_delete'),
    path('angajat-profil/<int:user_id>/', views.employee_detail, name='employee-detail'),
    path('angajat-concedii/<int:user_id>/', views.employee_leaves, name='employee-leaves'),
    path('employee-edit/<int:user_id>/', views.edit_employee, name='edit_employee'),
    path('gestionare-feedback/', views.list_feedback_forms, name='list_feedback_forms'),
    path('formulare-feedback/', views.list_feedback_forms, name='formulare_feedback'),
    path('feedback/delete/<int:form_id>/', views.delete_feedback_form, name='delete_feedback_form'),
    path('feedback/create/', views.create_feedback, name='create_feedback'),
    path('feedback/submit/<int:form_id>/', views.submit_employee_feedback, name='submit_employee_feedback'),
    path('feedback-details/<int:form_id>/', views.feedback_form_details, name='feedback_form_details'),
    path('feedback/statistics/', views.feedback_statistics, name='feedback_statistics'),
    path('feedback/delete-form/<int:form_id>/', views.delete_feedback_form, name='delete_feedback_form'),
    path('feedback/delete-question/<int:question_id>/', views.delete_feedback_question, name='delete_feedback_question'),
    path('feedback/update-question/<int:question_id>/', views.update_feedback_question, name='update_feedback_question'),
    path('feedback/add-question/<int:form_id>/', views.add_feedback_question, name='add_feedback_question'),
    path('feedback/update-form/<int:form_id>/', views.update_feedback_form, name='update_feedback_form'),
    path('feedback/add-form/', views.create_feedback_form, name='create_feedback_form'),
    path('trainings/<int:company_id>/', views.list_trainings_for_company, name='list-trainings-for-company'),
    path('training/<int:user_id>/', views.employee_list_trainings, name='employee_list-trainings'),
    path('trainings/create/', views.create_training, name='create-training'),
    path('trainings/update/<int:training_id>/', views.update_training, name='update-training'),
    path('trainings/delete/<int:training_id>/', views.delete_training, name='delete-training'),
    path('trainings/statistics/', views.training_statistics, name='training-statistics'),
    path('training-rapoarte/', views.training_report, name='training-report'),
    path('trainings/<int:training_id>/add-participant/', views.add_participant, name='add-participant'),
    path('trainings/<int:training_id>/details/', views.training_details, name='training-details'),
    path('trainings/register/<int:training_id>/', views.register_to_training, name='register_to_training'),
    path('department-rapoarte/', views.department_report, name='department-rapoarte'),
    path('update-company/<int:company_id>/', views.update_company, name='update-company'),
    path('add-event-owner/', views.add_event_owner, name='add-event-owner'),
    path('companies/<int:company_id>/employees/', views.list_employees_owner, name='list-employees'),
    path('employees/', views.create_employee_view, name='create-employee'),
    path('create-hr/', views.create_hr_user, name='create-hr-user'),
    path('create-employee/', views.create_employee_user, name='create-employee-user'),
    path('employees/<int:user_id>/delete/', views.delete_employee, name='delete-employee'),
    path('hr/<int:user_id>/delete/', views.delete_hr, name='delete-hr'),
    path('owner/angajat-profil/<int:user_id>/', views.owner_employee_profile, name='owner-employee-profile'),
    path('employee/<int:user_id>/trainings/', views.employee_training_list, name='employee-training-list'),
    path('employee/<int:user_id>/feedback/', views.employee_feedback_list, name='employee-feedback-list'),
    path('employee/<int:user_id>/feedback-reports/', views.employee_feedback_reports, name='employee-feedback-reports'),
    path('training-reports/', views.owner_training_reports, name='training-reports'),
    path('trainings/<int:training_id>/', views.training_detail_owner, name='training-detail'),
    path('', RedirectView.as_view(url=reverse_lazy('acasa'), permanent=False)),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += [
        re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    ]



