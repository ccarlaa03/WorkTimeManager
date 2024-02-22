from rest_framework import serializers
from .models import Angajat

class AngajatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Angajat
        fields = ['nume', 'post', 'departament', 'ore_lucrate', 'zile_libere']