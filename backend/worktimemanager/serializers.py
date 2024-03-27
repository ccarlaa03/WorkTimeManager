from rest_framework import serializers
from .models import User, Company, Employee, Owner, Event, HR, WorkSchedule, Feedback, Leave, Training


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'is_active', 'is_hr', 'is_employee', 'is_owner', 'role']
        
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
    def update(self, instance, validated_data):
        instance.is_hr = validated_data.get('is_hr', instance.is_hr)
        instance.is_employee = validated_data.get('is_employee', instance.is_employee)
        instance.is_owner = validated_data.get('is_owner', instance.is_owner)
        instance.save()
        return instance
        

class OwnerSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Owner
        fields = '__all__'
        extra_kwargs = {'user': {'required': False}}

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'  
  
class HRSerializer(serializers.ModelSerializer):
    company_id = serializers.IntegerField(source='company.id')
    class Meta:
        model = HR
        fields = '__all__'

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'
        extra_kwargs = {'user': {'required': False}}
class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class WorkScheduleSerializer(serializers.ModelSerializer):
    employee_user = serializers.CharField(source='employee.user', read_only=True)
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    employee_department = serializers.CharField(source='employee.department', read_only=True)

    class Meta:
        model = WorkSchedule
        fields = ['id', 'start_time', 'end_time', 'date', 'overtime_hours', 'shift_type', 'employee_user', 'employee_name', 'employee_department']


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'
        extra_kwargs = {'user': {'required': False}}
class LeaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave
        fields = '__all__'
        extra_kwargs = {'user': {'required': False}}
class TrainingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Training
        fields = '__all__'
        extra_kwargs = {'user': {'required': False}}