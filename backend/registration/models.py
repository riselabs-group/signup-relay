from django.db import models
class RelayAccount(models.Model):
 username=models.CharField(max_length=32); domain=models.CharField(max_length=255); email=models.EmailField(unique=True); stalwart_id=models.CharField(max_length=128,blank=True); provisioning_status=models.CharField(max_length=20,default='created'); request_id=models.UUIDField(null=True,blank=True,unique=True); created_at=models.DateTimeField(auto_now_add=True)
 class Meta:
  constraints=[models.UniqueConstraint(fields=['username','domain'],name='unique_relay_username')]
  indexes=[models.Index(fields=['domain','username'],name='registration_domain_4a5c2f_idx'),models.Index(fields=['provisioning_status'],name='reg_relay_prov_idx')]
  verbose_name='حساب رله'; verbose_name_plural='حساب‌های رله'

class Relay(models.Model):
 name=models.CharField(max_length=120); slug=models.SlugField(unique=True); domain=models.CharField(max_length=255,unique=True); description=models.TextField(blank=True); is_active=models.BooleanField(default=True); created_at=models.DateTimeField(auto_now_add=True)
 def __str__(self): return f'{self.name} ({self.domain})'
 class Meta: verbose_name='رله'; verbose_name_plural='رله‌ها'

class BlogPost(models.Model):
 title=models.CharField(max_length=200); slug=models.SlugField(unique=True); excerpt=models.CharField(max_length=320); content=models.TextField(); cover_url=models.URLField(blank=True); published=models.BooleanField(default=False); published_at=models.DateTimeField(null=True,blank=True); created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
 class Meta:
  ordering=['-published_at','-created_at']; verbose_name='مقاله وبلاگ'; verbose_name_plural='مقالات وبلاگ'
 def __str__(self): return self.title
