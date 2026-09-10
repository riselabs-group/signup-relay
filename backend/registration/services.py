import os, requests
class StalwartError(Exception): pass
class StalwartProvisioner:
 def __init__(self):
  self.url=os.getenv('STALWART_ADMIN_URL','').rstrip('/'); self.token=os.getenv('STALWART_ADMIN_TOKEN',''); self.dry=os.getenv('STALWART_DRY_RUN','true').lower()=='true'
 def create_account(self,email,password):
  if self.dry:return {'id':email,'dry_run':True}
  if not self.url or not self.token: raise StalwartError('Stalwart is not configured')
  r=requests.post(f'{self.url}/api/account',json={'name':email,'secret':password},headers={'Authorization':f'Bearer {self.token}'},timeout=10)
  if r.status_code not in (200,201): raise StalwartError(f'provisioning failed ({r.status_code})')
  return r.json() if r.content else {'id':email}
