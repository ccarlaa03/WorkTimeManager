from django.http import Http404
from django.db.models import Count
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .models import User, Company, Employee, Owner, Event, HR, FeedbackForm, FeedbackQuestion, EmployeeFeedback, WorkSchedule, Leave
from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from .serializers import UserSerializer, CompanySerializer, EmployeeSerializer, CompanySerializer, EventSerializer, HRSerializer,  FeedbackFormSerializer, FeedbackQuestionSerializer, EmployeeFeedbackSerializer, WorkScheduleSerializer, LeaveSerializer, FeedbackResponseOptionSerializer
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.authtoken.models import Token
import logging
from .decorators import is_hr, is_employee, is_owner;
from rest_framework import viewsets
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from django.shortcuts import get_object_or_404
from datetime import datetime
from django.db.models.signals import post_save
from django.dispatch import receiver

User = get_user_model()
logger = logging.getLogger(__name__)

@receiver(post_save, sender=Response)
def update_total_score(sender, instance, created, **kwargs):
    if instance.feedback:
        instance.feedback.calculate_total_score()

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    with transaction.atomic():
        company_data = {
            'name': request.data.get('company_name'),
            'address': request.data.get('company_address'),
            'phone_number': request.data.get('company_phone_number'),
            'email': request.data.get('company_email'),
            'industry': request.data.get('company_industry'),
            'number_of_employees': request.data.get('company_number_of_employees'),
            'founded_date': request.data.get('company_founded_date'),
        }
        company_serializer = CompanySerializer(data=company_data)
        if company_serializer.is_valid():
            company = company_serializer.save()
            
            # Aici creezi user-ul și îl asociezi companiei ca proprietar
            user_data = {
            'email': request.data.get('email'),
            'password': request.data.get('password'),
            'role': 'owner',  # Asumăm că acesta este rolul pentru proprietar
            'owner_name': request.data.get('owner_name', ''),  # Setăm owner_name dacă este furnizat
    }
            User = get_user_model()
            user = User.objects.create_user(email=user_data['email'], password=user_data['password'])

            user.save()

            # Creează o instanță de Owner și o asociază cu compania și user-ul
            owner_name = request.data.get('owner_name')  
            owner = Owner.objects.create(user=user, owner_name=owner_name, company=company)

            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        else:
            return Response(company_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, email=email, password=password)
    logger.debug('Login attempt for email: {}'.format(email))   
    
    if user is not None:
        login(request, user)
        

        refresh = RefreshToken.for_user(user)
        
        logger.debug('JWT tokens created for {}: access {}, refresh {}'.format(user.email, str(refresh.access_token), str(refresh)))

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user_id': user.id,
            'email': user.email,
            'role': user.role,
        }, status=status.HTTP_200_OK)
    else:
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                return Response({'error': 'Login failed for an unknown reason.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response({'error': 'Incorrect password.'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Email does not exist.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def acasa_view(request):
    if request.method == 'GET':
        data = {
            'message': 'Bine ați venit la WorkTimeManager!',
        }
        return Response(data)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_employee_view(request):

    if request.user.role == 'owner':
        user_data = {
            'email': request.data.get('email'),
            'password': request.data.get('password'),
            'role': request.data.get('role'), 
        }
        user = User.objects.create_user(**user_data)
        is_hr = user_data['role'] == 'hr'
        employee = Employee.objects.create(user=user, is_hr=is_hr, **request.data)
        return Response(EmployeeSerializer(employee).data, status=status.HTTP_201_CREATED)
    else:
        return Response({'error': 'Doar proprietarul poate adăuga angajați sau HR.'}, status=status.HTTP_403_FORBIDDEN)

@api_view(['POST'])
@permission_classes([IsAdminUser]) 
def create_hr_user(request):
    serializer = HRSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_employee(request):
    if request.method == 'POST':
        hr_company_id = request.data.get('company_id') 
        employee_user_id = request.data.get('user_id') 
        request.data['user_id'] = employee_user_id
        request.data['company_id'] = hr_company_id
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        else: 
            return Response(serializer.errors, status=400)

@api_view(['GET'])  # sau metoda HTTP adecvată
def check_user_exists(request):
    # Implementează logica funcției aici
    return Response({"message": "Funcția check_user_exists funcționează corect."})
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh_token')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAdminUser]) 

def owner_dashboard(request):
    try:
        owner = request.user.owner  
        company = owner.company
        events = company.events.all()
        company_data = CompanySerializer(company).data
        events_data = EventSerializer(events, many=True).data
        return Response({'company': company_data, 'events': events_data})
    except Exception as e:
        logger.error(f'Eroare la procesarea request-ului: {str(e)}')
        return Response({'error': 'A avut loc o eroare.'}, status=500)

   
@api_view(['GET'])
@permission_classes([IsAdminUser]) 
def company_details_view(request):
    try:
        owner = request.user.owner 
        company = owner.company
        serializer = CompanySerializer(company)
        return Response(serializer.data)
    except Owner.DoesNotExist:
        return Response({'error': 'Acest utilizator nu este un owner.'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_event(request):
    company = request.user.hr.company 
    event_data = request.data
    event_data['company'] = company.id  
    serializer = EventSerializer(data=event_data)
    if serializer.is_valid():
        serializer.save() 
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hr_dashboard(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=403)

    if not hasattr(request.user, 'hr'):
        return Response({'error': 'Nu aveți permisiunea de a accesa această resursă.'}, status=403)

    try:
        hr = request.user.hr
        company_name = hr.company.name if hr.company else None  
        return Response({
            'id': hr.user.id,
            'name': hr.name,
            'department': hr.department,
            'position': hr.position,
            'company': company_name,  
            'company_id': hr.company_id,
        })
    except HR.DoesNotExist:
        return Response({'error': 'HR profile not found'}, status=404)
    except Exception as e:
        return Response({'error': 'An unexpected error occurred'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@is_employee
def employee_dashboard(request):
    try:
        employee_profile = Employee.objects.filter(user=request.user, is_hr=False).first()
        if employee_profile:
            company = employee_profile.company
            events = Event.objects.filter(company=company)
            return Response({
                'employee_info': EmployeeSerializer(employee_profile).data, 
                'events': EventSerializer(events, many=True).data
            })
        else:
            return Response({'error': 'Profilul angajatului nu există sau accesul nu este permis.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_employees(request):
    employees = Employee.objects.all()
    serializer = EmployeeSerializer(employees, many=True)
    return Response(serializer.data)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_employee(request, user_id):
    employee = get_object_or_404(Employee, user = user_id)
    serializer = EmployeeSerializer(employee, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_employee(request, user_id):
    employee = get_object_or_404(Employee, user=user_id)
    employee.delete()
    return Response(status=204)
 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def events_view(request):
    user = request.user
    company = None

    if hasattr(user, 'owner'):
        company = user.owner.company
    elif hasattr(user, 'hr'):
        company = user.hr.company
    elif hasattr(user, 'employee'):
        company = user.employee.company

    if company:
        events = Event.objects.filter(company=company)
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'No company found for user.'}, status=status.HTTP_404_NOT_FOUND)

    
class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request, user_id):
    try:
        hr = HR.objects.get(user__id=user_id)
        serializer = HRSerializer(hr, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except HR.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)


    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_hr(request, pk):
    try:
        hr = HR.objects.get(pk=pk)
        hr.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except HR.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
  
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_hr(request):
    hrs = HR.objects.all()
    serializer = HRSerializer(hrs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def workschedule_list(request):
    schedules = WorkSchedule.objects.all()
    serializer = WorkScheduleSerializer(schedules, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_workschedule_list(request, user_id):
    schedules = WorkSchedule.objects.filter(user_id=user_id)
    serializer = WorkScheduleSerializer(schedules, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def workschedule_create(request):
    employee_user_id = request.data.get('employee_user_id') 

    try:
        employee = Employee.objects.get(user_id=employee_user_id)
    except Employee.DoesNotExist:
        return Response({'error': 'Employee does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    request.data['user'] = employee_user_id  
    serializer = WorkScheduleSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save() 
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def workschedule_retrieve(request, id):
    try:
        schedule = WorkSchedule.objects.get(id=id)
    except WorkSchedule.DoesNotExist:
        return Response({'message': 'The WorkSchedule does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = WorkScheduleSerializer(schedule)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def workschedule_update(request, id):
    try:
        schedule = WorkSchedule.objects.get(id=id)
    except WorkSchedule.DoesNotExist:
        return Response({'message': 'The WorkSchedule does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = WorkScheduleSerializer(schedule, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def workschedule_delete(request, id):
    try:
        schedule = WorkSchedule.objects.get(id=id)
    except WorkSchedule.DoesNotExist:
        return Response({'message': 'The WorkSchedule does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    schedule.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_list_create(request):
    leave_data = request.data
    leave_type = leave_data.get('leave_type')
    start_date = leave_data.get('start_date')
    end_date = leave_data.get('end_date')
    reason = leave_data.get('reason')

    created_leaves = []

    for user_id in leave_data.get('users', []):
        employee_instance = get_object_or_404(Employee, pk=user_id)
        leave_instance = Leave.objects.create(
            user=employee_instance,
            start_date=start_date,
            end_date=end_date,
            leave_type=leave_type,
            leave_description=reason,
            # alte câmpuri după caz
        )
        created_leaves.append(leave_instance)

    serializer = LeaveSerializer(created_leaves, many=True)
    return Response(serializer.data, status=status.HTTP_201_CREATED)



@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def leave_detail(request, id):
    try:
        leave = Leave.objects.get(id=id)
        if not request.user.is_hr and leave.user != request.user:
            return Response({'message': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    except Leave.DoesNotExist:
        return Response({'message': 'Concediul nu există.'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = LeaveSerializer(leave)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = LeaveSerializer(leave, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        leave.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leave_list(request):
    schedules = Leave.objects.all()
    serializer = LeaveSerializer(schedules, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_leaves(request, user_id):
    leaves = Leave.objects.filter(user_id=user_id)
    serializer = LeaveSerializer(leaves, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def leave_delete(request, id):
    try:
        schedule = Leave.objects.get(id=id)
    except Leave.DoesNotExist:
        return Response({'message': 'The WorkSchedule does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    schedule.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_detail(request, user_id):
    logger.debug(f"Starting employee_detail view for user_id: {user_id}")
    employee = get_object_or_404(Employee, user=user_id)
    serializer = EmployeeSerializer(employee)
    logger.debug(f"Serialized data: {serializer.data}")
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_employee(request, user_id):
    employee = get_object_or_404(Employee, user_id=user_id)
    serializer = EmployeeSerializer(employee, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def list_feedback_forms(request):
    forms = FeedbackForm.objects.all().order_by('-created_at')  
    serializer = FeedbackFormSerializer(forms, many=True)
    return Response(serializer.data)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_feedback_form(request, form_id):
    try:
        feedback_form = FeedbackForm.objects.get(id=form_id, created_by=request.user)
        feedback_form.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except FeedbackForm.DoesNotExist:
        return Response({'error': 'Formularul de feedback nu există sau nu ai permisiunea de a-l șterge.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def feedback_form_details(request, form_id):
    try:
        form = FeedbackForm.objects.prefetch_related('questions__options').get(id=form_id)
    except FeedbackForm.DoesNotExist:
        return Response({'error': 'Formularul de feedback nu există.'}, status=status.HTTP_404_NOT_FOUND)

    form_serializer = FeedbackFormSerializer(form)
    return Response(form_serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_feedback(request):
    if not request.user.is_hr:
        return Response({'error': 'Only HR can create feedback.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = EmployeeFeedbackSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_feedback_question(request, form_id):
    print("Received data:", request.data)  # Log the incoming data

    try:
        feedback_form = FeedbackForm.objects.get(id=form_id)
    except FeedbackForm.DoesNotExist:
        return Response({'error': 'Formularul de feedback nu există.'}, status=status.HTTP_404_NOT_FOUND)

    question_data = {
        'form': feedback_form.id,
        'text': request.data.get('text'),
        'order': request.data.get('order'),
        'response_type': request.data.get('response_type'),
        'rating_scale': request.data.get('rating_scale') if 'rating_scale' in request.data else None,
        'importance': request.data.get('importance') if 'importance' in request.data else None,
    }
    question_serializer = FeedbackQuestionSerializer(data=question_data)
    
    if question_serializer.is_valid():
        feedback_question = question_serializer.save()
        
        options_data = request.data.get('options', [])
        for option_data in options_data:
            option_serializer = FeedbackResponseOptionSerializer(data=option_data)
            if option_serializer.is_valid():
                option_serializer.save(question=feedback_question)
            else:
                return Response(option_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(FeedbackQuestionSerializer(feedback_question).data, status=status.HTTP_201_CREATED)
    else:
        print(question_serializer.errors)  
        return Response(question_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_employee_feedback(request, form_id):
    try:
        feedback_form = FeedbackForm.objects.get(id=form_id, is_active=True)
    except FeedbackForm.DoesNotExist:
        return Response({'error': 'Formularul de feedback nu este activ sau nu există.'}, status=status.HTTP_404_NOT_FOUND)

    questions = request.data.get('questions', {})

    for question_id, response in questions.items():
        try:
            feedback_question = FeedbackQuestion.objects.get(id=question_id, form=feedback_form)
        except FeedbackQuestion.DoesNotExist:
            continue  

        EmployeeFeedback.objects.create(
            employee=request.user,
            form=feedback_form,
            question=feedback_question,
            response=response
        )
    return Response({'message': 'Feedback-ul a fost trimis cu succes!'}, status=status.HTTP_201_CREATED)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def feedback_statistics(request):
    # Generați statistici, de exemplu, numărul de răspunsuri per formular
    stats = EmployeeFeedback.objects.values('form__title').annotate(response_count=Count('id')).order_by('-response_count')
    return Response({'statistics': stats})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_feedback_form(request, form_id):
    try:
        feedback_form = FeedbackForm.objects.get(id=form_id)
        feedback_form.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except FeedbackForm.DoesNotExist:
        return Response({'error': 'Formularul de feedback nu există.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_feedback_question(request, question_id):
    try:
        feedback_question = FeedbackQuestion.objects.get(id=question_id)
        feedback_question.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except FeedbackQuestion.DoesNotExist:
        return Response({'error': 'Întrebarea de feedback nu există.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_feedback_question(request, question_id):
    try:
        feedback_question = FeedbackQuestion.objects.get(id=question_id)
        serializer = FeedbackQuestionSerializer(feedback_question, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except FeedbackQuestion.DoesNotExist:
        return Response({'error': 'Question does not exist.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_feedback_form(request, form_id):
    try:
        feedback_form = FeedbackForm.objects.get(id=form_id)
        serializer = FeedbackFormSerializer(feedback_form, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except FeedbackForm.DoesNotExist:
        return Response({'error': 'Formularul de feedback nu există.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_feedback_form(request):
    serializer = FeedbackFormSerializer(data=request.data)
    if serializer.is_valid():
        feedback_form = serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)