from django.urls import path
from .views import config,signup,username,api_index,blog,altcha_challenge
urlpatterns=[path('',api_index),path('config/',config),path('blog/',blog),path('altcha/challenge/',altcha_challenge),path('username/<str:value>/',username),path('signup/',signup)]
