from django.db import migrations
from django.utils import timezone

POSTS = [
    {
        'title': 'چرا یک رله مستقل برای Delta Chat مهم است؟',
        'slug': 'why-independent-deltachat-relay-matters',
        'excerpt': 'رله مستقل یعنی کنترل بیشتر روی هویت، داده‌ها و مسیر ارتباط؛ بدون وابستگی به پلتفرم‌های متمرکز.',
        'content': 'Delta Chat تجربه پیام‌رسانی آشنا را روی استانداردهای باز ایمیل می‌سازد.\n\nوقتی از یک رله مستقل استفاده می‌کنید، آدرس شما به یک شرکت تبلیغاتی یا شبکه اجتماعی وابسته نیست. R.I.S.E با تمرکز بر حریم خصوصی، حداقل‌سازی داده و استانداردهای باز طراحی شده است.\n\nهدف ما ساده است: ارتباطی قابل اتکا، بدون ردیابی و با کنترل بیشتر برای کاربر.',
        'published': True,
    },
    {
        'title': 'پنج قدم برای ساختن یک هویت دیجیتال امن‌تر',
        'slug': 'five-steps-to-a-safer-digital-identity',
        'excerpt': 'از رمز عبور منحصربه‌فرد تا شناخت حملات فیشینگ؛ چند عادت کوچک که امنیت شما را جدی‌تر می‌کند.',
        'content': 'امنیت با ابزار پیچیده شروع نمی‌شود؛ با عادت‌های درست شروع می‌شود.\n\nبرای هر سرویس رمز عبور منحصربه‌فرد انتخاب کنید، نرم‌افزارها را به‌روز نگه دارید و لینک‌های ناشناس را با دقت باز کنید. اطلاعات بازیابی حساب را در مکانی امن نگه دارید و هیچ‌گاه رمز عبور خود را برای پشتیبانی ارسال نکنید.\n\nR.I.S.E رمز عبور شما را در لاگ‌ها ثبت نمی‌کند و آن را فقط برای ساخت امن حساب به هسته ارسال می‌کند.',
        'published': True,
    },
    {
        'title': 'R.I.S.E چگونه از حریم خصوصی شما محافظت می‌کند؟',
        'slug': 'how-rise-protects-your-privacy',
        'excerpt': 'نگاهی شفاف به معماری چندرله‌ای، حداقل‌سازی لاگ‌ها و کنترل‌های ضدسوءاستفاده در R.I.S.E.',
        'content': 'هر رله یک ورودی مستقل با نام و دامنه خودش دارد، اما پردازش حساب‌ها در هسته امن مرکزی انجام می‌شود. ارتباط میان رله و هسته از تونل رمزنگاری‌شده عبور می‌کند.\n\nتوکن مدیریت Stalwart هیچ‌وقت به مرورگر ارسال نمی‌شود. عملیات حساس فقط در Backend انجام می‌شود و rate limit و ALTCHA از ثبت‌نام انبوه جلوگیری می‌کنند.\n\nما رویدادهای امنیتی لازم را ثبت می‌کنیم، اما رمز عبور و کلیدهای مدیریتی در لاگ جایی ندارند.',
        'published': True,
    },
]

def seed(apps, schema_editor):
    BlogPost = apps.get_model('registration', 'BlogPost')
    now = timezone.now()
    for post in POSTS:
        BlogPost.objects.get_or_create(slug=post['slug'], defaults={**post, 'published_at': now})

def unseed(apps, schema_editor):
    apps.get_model('registration', 'BlogPost').objects.filter(slug__in=[p['slug'] for p in POSTS]).delete()

class Migration(migrations.Migration):
    dependencies = [('registration', '0002_relay_blogpost')]
    operations = [migrations.RunPython(seed, unseed)]
