from django.db import models
from rest_framework import serializers
from django.contrib.auth.models import User



class CreateSettingsUserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password')


class LoginUserSerializerEins(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ('username', 'password')

    
class LoginUserSerializerZwei(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ('email', 'password')

