from django.urls import include,path
from registration.views import api_index
from django.contrib import admin
from django.conf.urls.i18n import set_language
urlpatterns=[path('',api_index),path('admin/',admin.site.urls),path('api/',include('registration.urls')),path('api',include('registration.urls'))]
urlpatterns += [path('i18n/setlang/', set_language, name='set_language')]
