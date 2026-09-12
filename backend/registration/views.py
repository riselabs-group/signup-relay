import logging,os,secrets,hashlib,hmac,base64,json
from django.conf import settings
from django.db import IntegrityError,transaction
from rest_framework.decorators import api_view,throttle_classes
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.response import Response
from .models import RelayAccount,BlogPost
from .serializers import SignupSerializer
from .services import StalwartError,StalwartProvisioner
log=logging.getLogger('security')
class SignupThrottle(ScopedRateThrottle): scope='signup'
class UsernameThrottle(ScopedRateThrottle): scope='username'
class ConfigThrottle(ScopedRateThrottle): scope='config'
class BlogThrottle(ScopedRateThrottle): scope='blog'
def _altcha_signature(algorithm,challenge,salt):
 return hmac.new(os.getenv('ALTCHA_HMAC_KEY','dev-altcha-key').encode(),f'{algorithm}:{challenge}:{salt}'.encode(),hashlib.sha256).hexdigest()
@api_view(['GET'])
@throttle_classes([SignupThrottle])
def altcha_challenge(request):
 salt=secrets.token_hex(16); number=secrets.randbelow(1000000); challenge=hashlib.sha256(f'{salt}{number}'.encode()).hexdigest()
 return Response({'algorithm':'SHA-256','challenge':challenge,'salt':salt,'signature':_altcha_signature('SHA-256',challenge,salt)})
def verify_altcha(value):
 if not value:return False
 try:
  d=json.loads(base64.b64decode(value).decode()); expected=_altcha_signature(d['algorithm'],d['challenge'],d['salt'])
  return hmac.compare_digest(expected,d['signature']) and hashlib.sha256(f"{d['salt']}{int(d['number'])}".encode()).hexdigest()==d['challenge']
 except Exception:return False
def relay_domain(): return os.getenv('RELAY_DOMAIN','rise.example')
@api_view(['GET'])
def api_index(request):
 return Response({'service':'R.I.S.E Relay Registration API','endpoints':{'config':'/api/config/','username_check':'/api/username/{username}/','signup':'/api/signup/'}})
@api_view(['GET'])
@throttle_classes([ConfigThrottle])
def config(request):
 return Response({'brand':'R.I.S.E','relay_name':os.getenv('RELAY_NAME','R.I.S.E Relay'),'domain':relay_domain(),'description':os.getenv('RELAY_DESCRIPTION','A private, secure home for Delta Chat.'),'registration_open':os.getenv('REGISTRATION_OPEN','true').lower()=='true','terms_url':os.getenv('TERMS_URL','#'),'privacy_url':os.getenv('PRIVACY_URL','#')})
@api_view(['GET'])
@throttle_classes([BlogThrottle])
def blog(request):
 posts=list(BlogPost.objects.filter(published=True))
 if not posts:
  return Response([{'title':'R.I.S.E Journal','slug':'rise-journal','excerpt':'Stories about privacy, open communication and Delta Chat.','content':'Welcome to the R.I.S.E Journal.','cover_url':'','published_at':None}])
 return Response([{'title':p.title,'slug':p.slug,'excerpt':p.excerpt,'content':p.content,'cover_url':p.cover_url,'published_at':p.published_at} for p in posts])
@api_view(['GET'])
@throttle_classes([UsernameThrottle])
def username(request,value): return Response({'available':not RelayAccount.objects.filter(username=value.lower(),domain=relay_domain()).exists()})
@api_view(['POST'])
@throttle_classes([SignupThrottle])
def signup(request):
 origin=request.headers.get('Origin')
 if origin and origin not in settings.CORS_ALLOWED_ORIGINS: return Response({'detail':'Invalid request origin.'},status=403)
 if os.getenv('REGISTRATION_OPEN','true').lower()!='true': return Response({'detail':'Registration is currently closed.'},status=423)
 if os.getenv('ALTCHA_REQUIRED','false').lower()=='true' and not verify_altcha(request.data.get('altcha')): return Response({'detail':'Please complete the anti-bot challenge.'},status=400)
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
