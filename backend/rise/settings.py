import os,importlib.util
from urllib.parse import urlparse
from pathlib import Path
BASE_DIR=Path(__file__).resolve().parent.parent
try:
 from dotenv import load_dotenv
 load_dotenv(BASE_DIR/'.env')
except ImportError:
 env_file=BASE_DIR/'.env'
 if env_file.exists():
  for line in env_file.read_text().splitlines():
   line=line.strip()
   if line and not line.startswith('#') and '=' in line:
    key,value=line.split('=',1); os.environ.setdefault(key.strip(),value.strip().strip('"\''))
SECRET_KEY=os.getenv('DJANGO_SECRET_KEY','dev-only-change-me'); DEBUG=os.getenv('DJANGO_DEBUG','true').lower()=='true'
if not DEBUG and SECRET_KEY in {'dev-only-change-me','local-only-change-this',''}: raise RuntimeError('DJANGO_SECRET_KEY must be set to a strong value when DEBUG=false')
ALLOWED_HOSTS=os.getenv('ALLOWED_HOSTS','localhost,127.0.0.1').split(',')
INSTALLED_APPS=(['jazzmin'] if importlib.util.find_spec('jazzmin') else [])+['django.contrib.admin','django.contrib.auth','django.contrib.contenttypes','django.contrib.sessions','django.contrib.messages','django.contrib.staticfiles','corsheaders','rest_framework','rest_framework.authtoken','registration']
MIDDLEWARE=['corsheaders.middleware.CorsMiddleware','django.middleware.security.SecurityMiddleware','django.contrib.sessions.middleware.SessionMiddleware','django.middleware.locale.LocaleMiddleware','django.middleware.common.CommonMiddleware','django.middleware.csrf.CsrfViewMiddleware','django.contrib.auth.middleware.AuthenticationMiddleware','django.contrib.messages.middleware.MessageMiddleware']
ROOT_URLCONF='rise.urls'; WSGI_APPLICATION='rise.wsgi.application'; LOGIN_URL='/admin/login/'
TEMPLATES=[{'BACKEND':'django.template.backends.django.DjangoTemplates','DIRS':[],'APP_DIRS':True,'OPTIONS':{'context_processors':['django.template.context_processors.request','django.contrib.auth.context_processors.auth','django.contrib.messages.context_processors.messages']}}]
DATABASES={'default':{'ENGINE':'django.db.backends.sqlite3','NAME':BASE_DIR/'db.sqlite3'}}
if os.getenv('DATABASE_URL'):
 db=urlparse(os.environ['DATABASE_URL']); DATABASES={'default':{'ENGINE':'django.db.backends.postgresql','NAME':(db.path or '/rise').lstrip('/'),'USER':db.username or os.getenv('POSTGRES_USER','rise'),'PASSWORD':db.password or os.getenv('POSTGRES_PASSWORD',''),'HOST':db.hostname or os.getenv('POSTGRES_HOST','localhost'),'PORT':str(db.port or os.getenv('POSTGRES_PORT','5432')),'CONN_MAX_AGE':60,'OPTIONS':{'sslmode':os.getenv('POSTGRES_SSLMODE','prefer')}}}
LANGUAGE_CODE=os.getenv('LANGUAGE_CODE','fa-ir'); LANGUAGES=[('fa','فارسی'),('en','English')]; TIME_ZONE=os.getenv('TIME_ZONE','Asia/Tehran'); USE_I18N=True; USE_TZ=True; STATIC_URL='static/'
# Vite may be opened using either hostname during local development. Production
# deployments must override this list with their exact HTTPS frontend origins.
CORS_ALLOWED_ORIGINS=[origin.strip() for origin in os.getenv('CORS_ALLOWED_ORIGINS','http://localhost:5173,http://127.0.0.1:5173').split(',') if origin.strip()]; CSRF_TRUSTED_ORIGINS=CORS_ALLOWED_ORIGINS
DEFAULT_AUTO_FIELD='django.db.models.BigAutoField'
AUTH_PASSWORD_VALIDATORS=[{'NAME':'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},{'NAME':'django.contrib.auth.password_validation.MinimumLengthValidator','OPTIONS':{'min_length':12}},{'NAME':'django.contrib.auth.password_validation.CommonPasswordValidator'},{'NAME':'django.contrib.auth.password_validation.NumericPasswordValidator'}]
if os.getenv('REDIS_URL'):
 CACHES={'default':{'BACKEND':'django_redis.cache.RedisCache','LOCATION':os.environ['REDIS_URL'],'OPTIONS':{'CLIENT_CLASS':'django_redis.client.DefaultClient'}}}
REST_FRAMEWORK={
 'DEFAULT_AUTHENTICATION_CLASSES':['rest_framework.authentication.TokenAuthentication'],
 'DEFAULT_THROTTLE_CLASSES':['rest_framework.throttling.ScopedRateThrottle'],
 'DEFAULT_THROTTLE_RATES':{'signup':'5/hour','username':'30/minute','config':'60/minute','blog':'60/minute','auth':'10/hour','mailbox':'30/hour'},
}
JAZZMIN_SETTINGS={'site_title':'R.I.S.E Control Center','site_header':'R.I.S.E','site_brand':'R.I.S.E Relay','welcome_sign':'داشبورد مدیریت رله R.I.S.E','copyright':'R.I.S.E','show_ui_builder':True,'navigation_expanded':True,'show_sidebar':True,'language_chooser':True,'topmenu_links':[{'name':'صفحه اصلی','url':'/','permissions':['auth.view_user']},{'name':'API','url':'/api/','permissions':['auth.view_user']},{'name':'Blog','url':'/api/blog/','permissions':['auth.view_user']}],'usermenu_links':[{'name':'صفحه اصلی','url':'/','new_window':False},{'model':'auth.user'}],'icons':{'registration':'fas fa-network-wired','registration.relay':'fas fa-server','registration.blogpost':'fas fa-newspaper','registration.relayaccount':'fas fa-user-shield','auth.user':'fas fa-users-cog','auth.group':'fas fa-user-lock'}}
JAZZMIN_UI_TWEAKS={'theme':'darkly','navbar_small_text':False,'footer_small_text':False,'sidebar_nav_small_text':False,'navbar_fixed':True,'sidebar_fixed':True,'sidebar':'sidebar-dark-primary','brand_colour':'navbar-success','accent':'accent-success','navbar':'navbar-dark'}
if not DEBUG:
 SECURE_SSL_REDIRECT=True; SESSION_COOKIE_SECURE=True; CSRF_COOKIE_SECURE=True; SECURE_HSTS_SECONDS=31536000; SECURE_HSTS_INCLUDE_SUBDOMAINS=True; SECURE_CONTENT_TYPE_NOSNIFF=True; X_FRAME_OPTIONS='DENY'; SECURE_PROXY_SSL_HEADER=('HTTP_X_FORWARDED_PROTO','https'); SECURE_REFERRER_POLICY='strict-origin-when-cross-origin'
