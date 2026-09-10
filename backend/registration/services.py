import os, requests
class StalwartError(Exception): pass
class StalwartProvisioner:
 def __init__(self):
  self.url=os.getenv('STALWART_JMAP_URL',os.getenv('STALWART_ADMIN_URL','')).rstrip('/'); self.token=os.getenv('STALWART_ADMIN_TOKEN',''); self.dry=os.getenv('STALWART_DRY_RUN','true').lower()=='true'; self.domain_id=os.getenv('STALWART_DOMAIN_ID','')
 def create_account(self,email,password):
  if self.dry:return {'id':email,'dry_run':True}
  if not self.url or not self.token: raise StalwartError('Stalwart is not configured')
  if not self.domain_id: raise StalwartError('STALWART_DOMAIN_ID is not configured')
  local=email.split('@',1)[0]
  payload={'using':['urn:ietf:params:jmap:core','urn:stalwart:jmap'],'methodCalls':[['x:Account/set',{'create':{'new1':{'@type':'User','name':local,'domainId':self.domain_id,'credentials':[{'@type':'Password','secret':password}],'memberGroupIds':{},'roles':{'@type':'User'},'permissions':{'@type':'Inherit'},'quotas':{},'aliases':{},'encryptionAtRest':{'@type':'Disabled'}}}},'c1']]}
  r=requests.post(f'{self.url}/api' if not self.url.endswith('/api') else self.url,json=payload,headers={'Authorization':f'Bearer {self.token}','Content-Type':'application/json'},timeout=10)
  if r.status_code not in (200,201): raise StalwartError(f'provisioning failed ({r.status_code})')
  data=r.json() if r.content else {}
  if any(call[0]=='error' for call in data.get('methodResponses',[])): raise StalwartError('JMAP account creation failed')
  return data
