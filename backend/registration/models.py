from django.db import models
class RelayAccount(models.Model):
 username=models.CharField(max_length=32); domain=models.CharField(max_length=255); email=models.EmailField(unique=True); created_at=models.DateTimeField(auto_now_add=True)
 class Meta: constraints=[models.UniqueConstraint(fields=['username','domain'],name='unique_relay_username')]
