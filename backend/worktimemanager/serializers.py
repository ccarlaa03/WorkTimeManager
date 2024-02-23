from rest_framework import serializers
from .models import User, Company, Employee, HR

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'is_active',]

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'address', 'phone_number', 'email', 'industry', 'number_of_employees', 'founded_date',]

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'user', 'nume', 'pozitie', 'departament', 'data_angajarii', 'ore_lucrate', 'zile_libere', 'is_hr']

class HRSerializer(serializers.ModelSerializer):
    class Meta:
        model = HR
        fields = ['id', 'user', 'nume', 'pozitie', 'departament', 'data_angajarii']
