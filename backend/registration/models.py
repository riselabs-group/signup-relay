from django.conf import settings
from django.db import models


class RelayAccount(models.Model):
 class Status(models.TextChoices):
  PENDING='pending','در انتظار'
  ACTIVE='active','فعال'
  FAILED='failed','ناموفق'
  SUSPENDED='suspended','تعلیق‌شده'
  DELETING='deleting','در حال حذف'
  DELETED='deleted','حذف‌شده'

 owner=models.ForeignKey(settings.AUTH_USER_MODEL,null=True,blank=True,on_delete=models.PROTECT,related_name='relay_accounts')
 relay=models.ForeignKey('Relay',null=True,blank=True,on_delete=models.PROTECT,related_name='accounts')
 username=models.CharField(max_length=32)
 domain=models.CharField(max_length=255)
 email=models.EmailField(unique=True)
 provider=models.CharField(max_length=32,default='stalwart')
 stalwart_id=models.CharField(max_length=128,blank=True)
 provisioning_status=models.CharField(max_length=20,choices=Status.choices,default=Status.PENDING)
 failure_code=models.CharField(max_length=64,blank=True)
 failure_message=models.CharField(max_length=255,blank=True)
 request_id=models.UUIDField(null=True,blank=True,unique=True)
 provisioned_at=models.DateTimeField(null=True,blank=True)
 created_at=models.DateTimeField(auto_now_add=True)
 updated_at=models.DateTimeField(auto_now=True)

 class Meta:
  constraints=[models.UniqueConstraint(fields=['username','domain'],name='unique_relay_username')]
  indexes=[models.Index(fields=['domain','username'],name='registration_domain_4a5c2f_idx'),models.Index(fields=['provisioning_status'],name='reg_relay_prov_idx'),models.Index(fields=['owner','provisioning_status'],name='reg_owner_status_idx')]
  verbose_name='حساب رله'; verbose_name_plural='حساب‌های رله'

 def __str__(self): return self.email

class Relay(models.Model):
 name=models.CharField(max_length=120)
 slug=models.SlugField(unique=True)
 domain=models.CharField(max_length=255,unique=True)
 description=models.TextField(blank=True)
 provider=models.CharField(max_length=32,default='stalwart')
 provider_domain_id=models.CharField(max_length=128,blank=True)
 registration_open=models.BooleanField(default=True)
 imap_host=models.CharField(max_length=255,blank=True)
 smtp_host=models.CharField(max_length=255,blank=True)
 is_active=models.BooleanField(default=True)
 created_at=models.DateTimeField(auto_now_add=True)
 updated_at=models.DateTimeField(auto_now=True)

 def __str__(self): return f'{self.name} ({self.domain})'
 class Meta: verbose_name='رله'; verbose_name_plural='رله‌ها'

class BlogPost(models.Model):
 title=models.CharField(max_length=200); slug=models.SlugField(unique=True); excerpt=models.CharField(max_length=320); content=models.TextField(); cover_url=models.URLField(blank=True); published=models.BooleanField(default=False); published_at=models.DateTimeField(null=True,blank=True); created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
 class Meta:
  ordering=['-published_at','-created_at']; verbose_name='مقاله وبلاگ'; verbose_name_plural='مقالات وبلاگ'
 def __str__(self): return self.title
