from django.contrib import admin
from django.utils import timezone
from .models import BlogPost,Relay,RelayAccount
@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
 list_display=('title','published','published_at','updated_at'); list_filter=('published','published_at'); list_editable=('published',); prepopulated_fields={'slug':('title',)}; search_fields=('title','excerpt','content'); date_hierarchy='published_at'; ordering=('-published_at',); save_on_top=True; list_per_page=25; actions=('publish_posts','unpublish_posts')
 fieldsets=((None,{'fields':('title','slug','excerpt')}),('محتوای مقاله',{'fields':('content','cover_url'),'classes':('wide',)}),('انتشار',{'fields':('published','published_at')}))
 @admin.action(description='انتشار مطالب انتخاب‌شده')
 def publish_posts(self,request,queryset): queryset.update(published=True,published_at=timezone.now())
 @admin.action(description='خارج کردن از حالت انتشار')
 def unpublish_posts(self,request,queryset): queryset.update(published=False)
@admin.register(Relay)
class RelayAdmin(admin.ModelAdmin): list_display=('name','domain','is_active'); list_filter=('is_active',); prepopulated_fields={'slug':('name',)}
@admin.register(RelayAccount)
class RelayAccountAdmin(admin.ModelAdmin): list_display=('email','domain','created_at'); search_fields=('email','username'); readonly_fields=('username','domain','email','created_at')
