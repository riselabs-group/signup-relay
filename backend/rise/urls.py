from django.urls import include,path
from registration.views import api_index
urlpatterns=[path('',api_index),path('api/',include('registration.urls')),path('api',include('registration.urls'))]
