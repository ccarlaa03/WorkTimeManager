from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import User, Company, Employee
from django.contrib.auth import authenticate, login
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer, CompanySerializer, EmployeeSerializer
from django.shortcuts import render
from .decorators import is_owner, is_hr, is_employee
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
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
        user_data = {
            'email': request.data.get('email'),
            'password': request.data.get('password'),
            'role': 'owner', 
        }
        user = User.objects.create_user(**user_data)
        user.company = company
        user.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    else:
        return Response(company_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(email=email, password=password)
    if user:
        login(request, user)
        return Response({'message': 'Autentificare reușită'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Autentificare eșuată'}, status=status.HTTP_400_BAD_REQUEST)

        
@api_view(['GET'])
def acasa_view(request):
    if request.method == 'GET':
        data = {
            'message': 'Bine ați venit la WorkTimeManager!',
        }
        return Response(data)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_employee_view(request):
    # Acest view este pentru owner pentru a crea angajați sau HR.
    if request.user.role != 'owner':
        return Response({"error": "Doar ownerii pot crea noi conturi."}, status=status.HTTP_403_FORBIDDEN)
    
    user_data = request.data.get('user')
    user_serializer = UserSerializer(data=user_data)
    if user_serializer.is_valid():
        user = user_serializer.save(company=request.user.company)
        employee_data = request.data.get('employee')
        employee_serializer = EmployeeSerializer(data=employee_data)
        if employee_serializer.is_valid():
            employee_serializer.save(user=user)
            return Response(employee_serializer.data, status=status.HTTP_201_CREATED)
        return Response(employee_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@is_employee
def employee_dashboard(request):
    # Logica pentru dashboard-ul Employee
    return render(request, 'Angajat-dashboard.js')

@is_employee
def employee_profile(request):
    # Logica pentru profilul Employee
    return render(request, 'angajat-profil.js')

@is_hr
def hr_dashboard(request):
    # Logica pentru dashboard-ul HR
    return render(request, 'hr_dashboard.html')

@is_hr
def hr_management(request):
    # Logica pentru managementul HR
    return render(request, 'hr_management.html')

@is_owner
def owner_dashboard(request):
    # Logica pentru dashboard-ul Owner
    return render(request, 'owner_dashboard.html')

@is_owner
def owner_settings(request):
    # Logica pentru setările Owner
    return render(request, 'owner_settings.html')