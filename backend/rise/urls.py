from django.urls import include,path
from registration.views import api_index
from django.contrib import admin
urlpatterns=[path('',api_index),path('admin/',admin.site.urls),path('api/',include('registration.urls')),path('api',include('registration.urls'))]
