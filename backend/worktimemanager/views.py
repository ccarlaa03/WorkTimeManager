from django.shortcuts import render

from django.http import HttpResponse

def home(request):
    return HttpResponse("Bine ai venit la pagina de acasă!")

def despre(request):
    return HttpResponse("Despre noi.")
