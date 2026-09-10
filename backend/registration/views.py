import logging,os
from django.conf import settings
from django.db import IntegrityError,transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import RelayAccount
from .serializers import SignupSerializer
from .services import StalwartError,StalwartProvisioner
log=logging.getLogger('security')
def relay_domain(): return os.getenv('RELAY_DOMAIN','rise.example')
@api_view(['GET'])
def api_index(request):
 return Response({'service':'R.I.S.E Relay Registration API','endpoints':{'config':'/api/config/','username_check':'/api/username/{username}/','signup':'/api/signup/'}})
@api_view(['GET'])
def config(request):
 return Response({'brand':'R.I.S.E','relay_name':os.getenv('RELAY_NAME','R.I.S.E Relay'),'domain':relay_domain(),'description':os.getenv('RELAY_DESCRIPTION','A private, secure home for Delta Chat.'),'registration_open':os.getenv('REGISTRATION_OPEN','true').lower()=='true','terms_url':os.getenv('TERMS_URL','#'),'privacy_url':os.getenv('PRIVACY_URL','#')})
@api_view(['GET'])
def username(request,value): return Response({'available':not RelayAccount.objects.filter(username=value.lower(),domain=relay_domain()).exists()})
@api_view(['POST'])
def signup(request):
 origin=request.headers.get('Origin')
 if origin and origin not in settings.CORS_ALLOWED_ORIGINS: return Response({'detail':'Invalid request origin.'},status=403)
 if os.getenv('REGISTRATION_OPEN','true').lower()!='true': return Response({'detail':'Registration is currently closed.'},status=423)
 s=SignupSerializer(data=request.data,context={'domain':relay_domain()})
 if not s.is_valid(): return Response(s.errors,status=400)
 email=f"{s.validated_data['username']}@{relay_domain()}"
 try:
  with transaction.atomic():
   account=RelayAccount.objects.create(username=s.validated_data['username'],domain=relay_domain(),email=email)
   StalwartProvisioner().create_account(email,s.validated_data['password'])
 except IntegrityError: return Response({'detail':'This username is unavailable.'},status=409)
 except StalwartError:
  log.exception('Stalwart provisioning failed email=%s',email); account.delete(); return Response({'detail':'We could not finish creating your account. Please try again.'},status=502)
 log.info('account_created email=%s',email)
 return Response({'email':email,'imap_host':os.getenv('IMAP_HOST',relay_domain()),'imap_port':993,'smtp_host':os.getenv('SMTP_HOST',relay_domain()),'smtp_port':465,'security':'TLS'},status=201)
