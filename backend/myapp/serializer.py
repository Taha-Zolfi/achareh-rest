
from rest_framework import serializers
from .models import CustomUser , student
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = student
        fields = '__all__'





class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            phone_number=validated_data['phone_number'],
            password=validated_data['password']
        )
        return user
    

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        user = authenticate(username=username, password=password)
        
        if user and user.is_active:
            data['user'] = user
        else:
            raise serializers.ValidationError("Invalid credentials")
        
        return data