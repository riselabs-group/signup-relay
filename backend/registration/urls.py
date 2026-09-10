from django.urls import path
from .views import config,signup,username,api_index
urlpatterns=[path('',api_index),path('config/',config),path('username/<str:value>/',username),path('signup/',signup)]
