from django.db import migrations,models
class Migration(migrations.Migration):
 initial=True; dependencies=[]
 operations=[migrations.CreateModel(name='RelayAccount',fields=[('id',models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name='ID')),('username',models.CharField(max_length=32)),('domain',models.CharField(max_length=255)),('email',models.EmailField(max_length=254,unique=True)),('created_at',models.DateTimeField(auto_now_add=True))],options={'constraints':[models.UniqueConstraint(fields=('username','domain'),name='unique_relay_username')]})]
