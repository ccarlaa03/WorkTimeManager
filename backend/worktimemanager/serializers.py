from rest_framework import serializers
from .models import User, Company, Employee, Owner, Event, HR, WorkSchedule,  FeedbackForm, FeedbackQuestion, EmployeeFeedback, Leave, Training, FeedbackResponseOption


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
    employee_name = serializers.CharField(source='user.name', read_only=True)
    employee_department = serializers.CharField(source='user.department', read_only=True)

    class Meta:
        model = WorkSchedule
        fields = ('id', 'start_time', 'end_time', 'date', 'overtime_hours', 'user', 'employee_name', 'employee_department')
        read_only_fields = ('id',)

class FeedbackResponseOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackResponseOption
        fields = ['id', 'text', 'score']      

class FeedbackQuestionSerializer(serializers.ModelSerializer):
    options = FeedbackResponseOptionSerializer(many=True, required=False, allow_null=True)
    importance = serializers.IntegerField(required=False, default=1)
    rating_scale = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = FeedbackQuestion
        fields = '__all__'

    def create(self, validated_data):
        options_data = validated_data.pop('options', None)
        question = FeedbackQuestion.objects.create(**validated_data)
        
        if options_data:
            for option_data in options_data:
                FeedbackResponseOption.objects.create(question=question, **option_data)

        return question

    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', [])
        
        # Actualizează întrebarea
        instance.text = validated_data.get('text', instance.text)
        instance.order = validated_data.get('order', instance.order)
        instance.response_type = validated_data.get('response_type', instance.response_type)
        instance.rating_scale = validated_data.get('rating_scale', instance.rating_scale)
        instance.save()

        current_option_ids = [option['id'] for option in options_data if 'id' in option]
        
        if instance.response_type == 'multiple_choice':
            # Procesează opțiunile doar pentru întrebările de tip "Multiple Choice"
            for option_data in options_data:
                option_id = option_data.get('id', None)
                if option_id:
                    option_instance = FeedbackResponseOption.objects.get(id=option_id, question=instance)
                    option_instance.text = option_data.get('text', option_instance.text)
                    option_instance.score = option_data.get('score', option_instance.score)
                    option_instance.save()
                else:
                    FeedbackResponseOption.objects.create(question=instance, **option_data)
                    
            # Șterge opțiunile care nu sunt incluse în actualizare
            FeedbackResponseOption.objects.filter(question=instance).exclude(id__in=current_option_ids).delete()
        
        return instance
    def validate(self, data):
        if data['response_type'] == 'multiple_choice' and not data.get('options'):
            raise serializers.ValidationError({"options": "This field is required for multiple choice questions."})
        return data
class EmployeeFeedbackSerializer(serializers.ModelSerializer):
    questions = FeedbackQuestionSerializer(many=True, read_only=True)
    employee_name = serializers.CharField(source='employee.name')
    questions_and_responses = serializers.SerializerMethodField()
    total_score = serializers.IntegerField()
    class Meta:
        model = EmployeeFeedback
        fields = ['id', 'employee_name', 'employee_department', 'form', 'questions', 'date_completed', 'questions_and_responses', 'total_score']
        depth = 1  
    def get_questions_and_responses(self, obj):
        responses = obj.responses.all()  
        return [
            {
                'question': response.question.text,
                'response': response.response,
                'score': response.score
            } for response in responses
        ]

class FeedbackFormSerializer(serializers.ModelSerializer):
    employee_feedbacks = EmployeeFeedbackSerializer(many=True, read_only=True, source='feedback_responses')
    hr_review_status_display = serializers.SerializerMethodField()
    questions = FeedbackQuestionSerializer(many=True, read_only=True)
    class Meta:
        model = FeedbackForm
        fields = '__all__'

    def get_hr_review_status_display(self, obj):
        return obj.get_hr_review_status_display()

class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='user.name', read_only=True)
    employee_department = serializers.CharField(source='user.department', read_only=True)
    class Meta:
        model = Leave
        fields = '__all__'
        read_only_fields = ('id',)

class TrainingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Training
        fields = '__all__'
        extra_kwargs = {'user': {'required': False}}
 