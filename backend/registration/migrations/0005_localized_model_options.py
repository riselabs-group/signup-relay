from django.db import migrations
class Migration(migrations.Migration):
 dependencies=[('registration','0004_account_provisioning_fields')]
 operations=[migrations.AlterModelOptions(name='relayaccount',options={'verbose_name':'حساب رله','verbose_name_plural':'حساب‌های رله'}),migrations.AlterModelOptions(name='relay',options={'verbose_name':'رله','verbose_name_plural':'رله‌ها'}),migrations.AlterModelOptions(name='blogpost',options={'ordering':['-published_at','-created_at'],'verbose_name':'مقاله وبلاگ','verbose_name_plural':'مقالات وبلاگ'})]
