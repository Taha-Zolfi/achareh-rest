from rest_framework.decorators import api_view ,permission_classes
from rest_framework.response import Response
from rest_framework import status , permissions
from datetime import timedelta
from .models import CustomUser, FailedLoginAttempt
import random
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.core.cache import cache


def generate_verification_code():
    return str(random.randint(100000, 999999))

@api_view(['POST'])
@permission_classes([AllowAny])
def check_phone(request):
    if is_ip_blocked(request.META.get('REMOTE_ADDR')):
        return Response("banned")

    phone_number = request.data.get('phone_number')
    if phone_number is None:
        return Response({'error': 'لطفا شماره خود را وارد کنید'}, status=status.HTTP_400_BAD_REQUEST)

    user = CustomUser.objects.filter(phone_number=phone_number).first()
    

    verification_code = generate_verification_code()

    if user:
        user.verification_code = verification_code
        user.verification_code_created_at = timezone.now()
        user.save()
        return Response({'exists': True}, status=status.HTTP_200_OK)
    else:
        return Response({'exists': False, 'verification_code': verification_code}, status=status.HTTP_200_OK)
    

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_code(request):
    if is_ip_blocked(request.META.get('REMOTE_ADDR')):
        return Response("banned")

    phone_number = request.data.get('phone_number')
    entered_code = request.data.get('code')

    try:
        user = CustomUser.objects.get(phone_number=phone_number)
    except CustomUser.DoesNotExist:
        return Response({'status': 'invalid'}, status=status.HTTP_400_BAD_REQUEST)

    if user.verification_code == entered_code:
        if (timezone.now() - user.verification_code_created_at).total_seconds() <= 300:
            return Response({'status': 'verified'}, status=status.HTTP_200_OK)
        else:
            return Response({'status': 'expired'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'status': 'invalid'}, status=status.HTTP_400_BAD_REQUEST)


    
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    if is_ip_blocked(request.META.get('REMOTE_ADDR')):
        return Response("banned")
    

    phone_number = request.data.get('phone_number')
    username = request.data.get('username')
    password = request.data.get('password')

    if username is None or password is None:
        return Response({'error': 'لطفا یک یوزر نیم یا پسورد قید کنید'}, status=status.HTTP_400_BAD_REQUEST)

    if CustomUser.objects.filter(username=username).exists():
        return Response({'error': 'یوزرنیم قبلا انتخاب شده'}, status=status.HTTP_400_BAD_REQUEST)

    user = CustomUser.objects.create_user(username=username, password=password, phone_number=phone_number)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    if is_ip_blocked(request.META.get('REMOTE_ADDR')):
        return Response("banned")
    phone_number = request.data.get('phone_number')

    password = request.data.get('password')
    customuser = CustomUser.objects.get(phone_number=phone_number)


    user = authenticate(username=customuser.username, password=password)
    if not user:
        FailedLoginAttempt.objects.create(ip_address=request.META.get('REMOTE_ADDR'))
        return Response({'error': 'رمز عبور اشتباه'}, status=status.HTTP_404_NOT_FOUND)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key}, status=status.HTTP_200_OK)



def is_ip_blocked(ip_address):
    time_threshold = timezone.now() - timedelta(minutes=60)
    FailedLoginAttempt.objects.filter(timestamp__lt=time_threshold).delete()
    failed_attempts = FailedLoginAttempt.objects.filter(ip_address=ip_address).count()
    return failed_attempts >= 3


@api_view(['GET'])
@permission_classes([AllowAny])
def home(request):
    if is_ip_blocked(request.META.get('REMOTE_ADDR')):
        return Response({
            'authenticated': False,
            'banned': True,
            'message': 'You are banned'
        })
    
    if not request.user.is_authenticated:
        return Response({
            'authenticated': False,
            'banned': False,
            'message': 'You are not logged in'
        })

    return Response({
        'authenticated': True,
        'username': request.user.username
    })



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:

        token = Token.objects.get(user=request.user)
        token.delete()
        return Response({"success": "Successfully logged out."}, status=status.HTTP_200_OK)
    except Token.DoesNotExist:
        return Response({"error": "Invalid token or user not logged in."}, status=status.HTTP_400_BAD_REQUEST)
