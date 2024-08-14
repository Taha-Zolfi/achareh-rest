from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class FailedLoginAttempt(models.Model):
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.ip_address

class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, unique=True)
    verification_code = models.CharField(max_length=6, blank=True, null=True)
    verification_code_created_at = models.DateTimeField(null=True, blank=True)  # زمان ایجاد کد تأیید
