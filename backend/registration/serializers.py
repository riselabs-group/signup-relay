import re
from rest_framework import serializers
from .models import RelayAccount
RESERVED={'admin','administrator','support','postmaster','abuse','security','root','noreply','no-reply','help','info'}
class SignupSerializer(serializers.Serializer):
 username=serializers.CharField(min_length=3,max_length=32); password=serializers.CharField(min_length=12,write_only=True); password_confirmation=serializers.CharField(write_only=True); accept_terms=serializers.BooleanField()
 def validate_username(self,v):
  v=v.strip().lower()
  if not re.fullmatch(r'[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])?',v): raise serializers.ValidationError('Use 3–32 lowercase letters, numbers, dot, dash or underscore.')
  if v in RESERVED: raise serializers.ValidationError('This username is reserved.')
  if RelayAccount.objects.filter(username=v,domain=self.context['domain']).exists(): raise serializers.ValidationError('This username is unavailable.')
  return v
 def validate(self,d):
  if d['password']!=d['password_confirmation']: raise serializers.ValidationError({'password_confirmation':'Passwords do not match.'})
  if not d['accept_terms']: raise serializers.ValidationError({'accept_terms':'You must accept the terms.'})
  if len(set(d['password']))<5: raise serializers.ValidationError({'password':'Choose a stronger password.'})
  return d
