from django.urls import path
from . import views

urlpatterns = [
    path('users/' , views.get_student , name='get_student'),
    path('users/create/' , views.create_student , name='create-student'),
    path('register/', views.register, name='user_registration'),
    path('login/', views.login, name='user_login'),
    path('home/', views.home, name='home'),
    path('check_phone/', views.check_phone, name='check_phone'),
     path('logout/', views.logout, name='logout'),

]   
