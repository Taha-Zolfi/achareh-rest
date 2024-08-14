from django.urls import path
from . import views

urlpatterns = [

    path('register/', views.register, name='user_registration'),
    path('login/', views.login, name='user_login'),
    path('home/', views.home, name='home'),
    path('check_phone/', views.check_phone, name='check_phone'),
    path('logout/', views.logout, name='logout'),
    path('verify_code/', views.verify_code, name='verify_code'),

]   
