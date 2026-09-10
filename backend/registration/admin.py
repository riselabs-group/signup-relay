from django.contrib import admin
from .models import BlogPost,Relay,RelayAccount
@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin): list_display=('title','published','published_at','updated_at'); list_filter=('published',); prepopulated_fields={'slug':('title',)}; search_fields=('title','content')
@admin.register(Relay)
class RelayAdmin(admin.ModelAdmin): list_display=('name','domain','is_active'); list_filter=('is_active',); prepopulated_fields={'slug':('name',)}
@admin.register(RelayAccount)
class RelayAccountAdmin(admin.ModelAdmin): list_display=('email','domain','created_at'); search_fields=('email','username'); readonly_fields=('username','domain','email','created_at')
