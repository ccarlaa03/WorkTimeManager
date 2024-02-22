from rest_framework.decorators import api_view
from django.contrib.auth.hashers import make_password
from .models import User
from django.contrib.auth import authenticate, login
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework import status
from .models import Angajat
from .serializers import AngajatSerializer


@api_view(['POST'])
def signup_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    hashed_password = make_password(password)
    role = request.data.get('role')
    user = User(email=email, password=hashed_password, role=role)
    user.save()
    return Response({"succes": "Utilizatorul a fost creat cu succes."}, status=201)


@api_view(['POST'])
def login_view(request):
    if request.method == "POST":
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            return Response({'access': 'token', 'role': user.role})
        else:
            return Response({'error': 'Autentificare eșuată. Verifică emailul și parola.'}, status=status.HTTP_400_BAD_REQUEST)

        
@api_view(['GET'])
def acasa_view(request):
    if request.method == 'GET':
        data = {
            'message': 'Bine ați venit la WorkTimeManager!',
        }
        return Response(data)

@api_view(['GET'])
def angajat_profil(request):
    angajat = request.user.angajat
    serializer = AngajatSerializer(angajat)
    return Response(serializer.data)