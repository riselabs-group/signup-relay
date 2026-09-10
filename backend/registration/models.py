from django.db import models
class RelayAccount(models.Model):
 username=models.CharField(max_length=32); domain=models.CharField(max_length=255); email=models.EmailField(unique=True); created_at=models.DateTimeField(auto_now_add=True)
 class Meta: constraints=[models.UniqueConstraint(fields=['username','domain'],name='unique_relay_username')]

class Relay(models.Model):
 name=models.CharField(max_length=120); slug=models.SlugField(unique=True); domain=models.CharField(max_length=255,unique=True); description=models.TextField(blank=True); is_active=models.BooleanField(default=True); created_at=models.DateTimeField(auto_now_add=True)
 def __str__(self): return f'{self.name} ({self.domain})'

class BlogPost(models.Model):
 title=models.CharField(max_length=200); slug=models.SlugField(unique=True); excerpt=models.CharField(max_length=320); content=models.TextField(); cover_url=models.URLField(blank=True); published=models.BooleanField(default=False); published_at=models.DateTimeField(null=True,blank=True); created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
 class Meta: ordering=['-published_at','-created_at']
 def __str__(self): return self.title
