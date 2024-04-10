from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .models import User, Company, Employee, Owner, Event, HR, Feedback, WorkSchedule, Leave
from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from .serializers import UserSerializer, CompanySerializer, EmployeeSerializer, CompanySerializer, EventSerializer, HRSerializer, FeedbackSerializer, WorkScheduleSerializer, LeaveSerializer
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

User = get_user_model()
logger = logging.getLogger(__name__)
                           
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

class FeedbackList(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer


    def post(self, request):
        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)   

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

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def leave_delete(request, id):
    try:
        schedule = Leave.objects.get(id=id)
    except Leave.DoesNotExist:
        return Response({'message': 'The WorkSchedule does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
    schedule.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)