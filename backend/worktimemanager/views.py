from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import User, Company, Employee, Owner, Event
from django.contrib.auth import authenticate, login, logout
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer, CompanySerializer, EmployeeSerializer, CompanySerializer, EventSerializer
from django.shortcuts import render
from .decorators import is_owner, is_hr, is_employee
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.authtoken.models import Token

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

    if user is not None:
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'role': user.role,
    }, status=status.HTTP_200_OK)
    else:
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                # Dacă parola este corectă dar userul nu a fost autentificat, poate exista o problemă cu metoda `authenticate`
                return Response({'error': 'Autentificarea a eșuat dintr-un motiv necunoscut.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response({'error': 'Parola este incorectă.'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Emailul nu există.'}, status=status.HTTP_404_NOT_FOUND)


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
    # Verifică dacă utilizatorul autentificat este owner.
    if request.user.role == 'owner':
        user_data = {
            'email': request.data.get('email'),
            'password': request.data.get('password'),
            'role': request.data.get('role')
        }
        
        # Verifică dacă rolul este corect.
        if user_data['role'] not in ['hr', 'employee']:
            return Response({"error": "Rol invalid."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Crează noul User și asociază-l cu compania owner-ului.
        user_data['company'] = request.user.company
        user_serializer = UserSerializer(data=user_data)
        
        if user_serializer.is_valid():
            user = user_serializer.save()
            user.set_password(user_data['password'])  # Asigură-te că parola este hash-uită.
            user.save()
            
            # Preia datele suplimentare pentru Employee, dacă există.
            employee_data = request.data.get('employee')
            if employee_data:
                employee_data['user'] = user.id  # Setează utilizatorul creat ca fiind asociat cu Employee.
                employee_serializer = EmployeeSerializer(data=employee_data)
                
                if employee_serializer.is_valid():
                    employee_serializer.save()
                    return Response(employee_serializer.data, status=status.HTTP_201_CREATED)
                else:
                    user.delete()  # Șterge utilizatorul dacă datele Employee nu sunt valide.
                    return Response(employee_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Dacă nu sunt date suplimentare Employee, returnează doar user.
                return Response(user_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def user_logout(request):
    logout(request)
    return render(request,'login')

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
    return render(request, 'hr-dashboard.js')

@is_hr
def hr_management(request):
    # Logica pentru managementul HR
    return render(request, 'hr_management.html')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_dashboard(request):
    user = request.user
    try:
        owner = user.owner
        company = owner.company
        events = Event.objects.filter(company=company)
        return Response({
            'company': CompanySerializer(company).data,
            'events': EventSerializer(events, many=True).data
        })
    except Owner.DoesNotExist:
        return Response({'error': 'Profilul de owner nu există.'}, status=404)

    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def company_details_view(request):
    # Presupunând că fiecare user are asociată o companie
    company = request.user.company
    serializer = CompanySerializer(company)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def events_view(request):
    company = request.user.company
    events = Event.objects.filter(company=company)
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)

