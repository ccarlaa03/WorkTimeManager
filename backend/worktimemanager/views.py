from django.http import HttpResponse
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response

def my_view(request):
    debug_mode = settings.DEBUG
    return HttpResponse(f"Debug mode is {'on' if debug_mode else 'off'}")

@api_view(['GET'])
def acasa(request):
    """View pentru pagina de acasă."""
    return Response("Bine ai venit la pagina de acasă!")

@api_view(['GET'])
def despre(request):
    """View pentru pagina 'Despre noi'."""
    return Response("Despre noi.")

@api_view(['GET'])
def contact(request):
    """View pentru pagina de contact."""
    return Response("Pagina de contact.")
