from django.contrib import admin
from .models import CustomUser ,FailedLoginAttempt
# Register your models here.

admin.site.register(CustomUser)
admin.site.register(FailedLoginAttempt)