from django.contrib import admin
from django.contrib import messages
from django.utils import timezone
from .models import BlogPost,Relay,RelayAccount
from .providers import ProviderError, get_email_provider
@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
 list_display=('title','published','published_at','updated_at'); list_filter=('published','published_at'); list_editable=('published',); prepopulated_fields={'slug':('title',)}; search_fields=('title','excerpt','content'); date_hierarchy='published_at'; ordering=('-published_at',); save_on_top=True; list_per_page=25; actions=('publish_posts','unpublish_posts')
 fieldsets=((None,{'fields':('title','slug','excerpt')}),('محتوای مقاله',{'fields':('content','cover_url'),'classes':('wide',)}),('انتشار',{'fields':('published','published_at')}))
 @admin.action(description='انتشار مطالب انتخاب‌شده')
 def publish_posts(self,request,queryset): queryset.update(published=True,published_at=timezone.now())
 @admin.action(description='خارج کردن از حالت انتشار')
 def unpublish_posts(self,request,queryset): queryset.update(published=False)
@admin.register(Relay)
class RelayAdmin(admin.ModelAdmin):
 list_display=('name','domain','provider','provider_domain_id','registration_open','is_active')
 list_filter=('provider','registration_open','is_active')
 search_fields=('name','domain','provider_domain_id')
 prepopulated_fields={'slug':('name',)}
 fieldsets=((None,{'fields':('name','slug','domain','description')}),('Email provider',{'fields':('provider','provider_domain_id','imap_host','smtp_host')}),('Availability',{'fields':('registration_open','is_active')}))
 actions=('provision_stalwart_domains',)

 @admin.action(description='Provision selected domains in their email provider')
 def provision_stalwart_domains(self,request,queryset):
  for relay in queryset:
   if relay.provider_domain_id:
    self.message_user(request,f'{relay.domain} already has provider domain id {relay.provider_domain_id}.',messages.WARNING)
    continue
   try:
    domain=get_email_provider(relay.provider).create_domain(relay.domain)
   except ProviderError as error:
    self.message_user(request,f'Could not provision {relay.domain}: {error.code}',messages.ERROR)
    continue
   relay.provider_domain_id=domain.id
   relay.save(update_fields=('provider_domain_id','updated_at'))
   self.message_user(request,f'{relay.domain} provisioned with provider domain id {domain.id}.',messages.SUCCESS)
@admin.register(RelayAccount)
class RelayAccountAdmin(admin.ModelAdmin):
 list_display=('email','owner','relay','provider','provisioning_status','stalwart_id','created_at')
 list_filter=('provider','provisioning_status','domain')
 search_fields=('email','username','stalwart_id','owner__username')
 list_select_related=('owner','relay')
 readonly_fields=('owner','relay','username','domain','email','provider','stalwart_id','request_id','provisioned_at','created_at','updated_at')
 fieldsets=((None,{'fields':('owner','relay','username','domain','email','provider','stalwart_id')}),('Provisioning',{'fields':('provisioning_status','failure_code','failure_message','request_id','provisioned_at')}),('Audit',{'fields':('created_at','updated_at')}))
