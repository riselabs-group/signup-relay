from django.db import migrations,models
import uuid
class Migration(migrations.Migration):
 dependencies=[('registration','0003_seed_blog_posts')]
 operations=[migrations.AddField(model_name='relayaccount',name='stalwart_id',field=models.CharField(blank=True,max_length=128)),migrations.AddField(model_name='relayaccount',name='provisioning_status',field=models.CharField(default='created',max_length=20)),migrations.AddField(model_name='relayaccount',name='request_id',field=models.UUIDField(blank=True,null=True,unique=True)),migrations.AddIndex(model_name='relayaccount',index=models.Index(fields=['domain','username'],name='registration_domain_4a5c2f_idx')),migrations.AddIndex(model_name='relayaccount',index=models.Index(fields=['provisioning_status'],name='reg_relay_prov_idx'))]
