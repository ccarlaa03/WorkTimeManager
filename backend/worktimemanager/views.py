from rest_framework.decorators import api_view
from django.contrib.auth.hashers import make_password
from .models import User
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken



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
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, username=email, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role
        }, status=200)
    else:
        return Response({"error": "Email sau parolă incorectă."}, status=400)