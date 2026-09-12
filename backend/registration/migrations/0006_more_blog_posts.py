from django.db import migrations
from django.utils import timezone

POSTS = [
 {'title':'راهنمای شروع با Delta Chat و R.I.S.E','slug':'getting-started-with-deltachat-and-rise','excerpt':'در چند دقیقه اولین گفت‌وگوی خود را روی یک آدرس خصوصی و استاندارد باز شروع کنید.','content':'R.I.S.E برای شروع ساده طراحی شده است. پس از ساخت آدرس، آن را در Delta Chat وارد کنید و تنظیمات IMAP و SMTP را طبق اطلاعات نمایش‌داده‌شده انجام دهید.\n\nDelta Chat به مخاطب خاصی وابسته نیست؛ شما می‌توانید با هر آدرس ایمیلی که از استانداردهای باز استفاده می‌کند گفت‌وگو کنید.','published':True},
 {'title':'چند رله، یک تجربه‌ی یکپارچه','slug':'many-relays-one-calm-experience','excerpt':'چطور یک codebase چندرله‌ای، نام و دامنه‌ی هر جامعه را بدون بازنویسی پشتیبانی می‌کند.','content':'هر رله‌ی R.I.S.E می‌تواند دامنه، رنگ و متن معرفی خودش را داشته باشد، در حالی که هسته‌ی امن و مسیر provisioning مشترک باقی می‌ماند.\n\nاین معماری هم هزینه‌ی نگهداری را پایین می‌آورد و هم تجربه‌ای یکدست برای کاربران Relayهای مختلف می‌سازد.','published':True},
 {'title':'امنیت بدون پیچیدگی اضافه','slug':'security-without-the-complexity','excerpt':'از rate limit تا حداقل‌سازی داده؛ کنترل‌هایی که بی‌سروصدا از سرویس محافظت می‌کنند.','content':'امنیت خوب لازم نیست تجربه را سخت کند. R.I.S.E از rate limit چندلایه، proof-of-work ضدربات، رمزنگاری در مسیر و لاگ‌های بدون داده‌ی حساس استفاده می‌کند.\n\nاین کنترل‌ها در پس‌زمینه فعال‌اند تا کاربر فقط یک ثبت‌نام سریع و شفاف ببیند.','published':True},
]
def seed(apps, schema_editor):
 BlogPost=apps.get_model('registration','BlogPost'); now=timezone.now()
 for post in POSTS: BlogPost.objects.get_or_create(slug=post['slug'],defaults={**post,'published_at':now})
def unseed(apps,schema_editor): apps.get_model('registration','BlogPost').objects.filter(slug__in=[p['slug'] for p in POSTS]).delete()
class Migration(migrations.Migration):
 dependencies=[('registration','0005_localized_model_options')]
 operations=[migrations.RunPython(seed,unseed)]
