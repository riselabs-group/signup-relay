from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def mark_legacy_accounts_active(apps, schema_editor):
    RelayAccount = apps.get_model("registration", "RelayAccount")
    RelayAccount.objects.filter(provisioning_status="created").update(provisioning_status="active")


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("registration", "0006_more_blog_posts"),
    ]

    operations = [
        migrations.AddField(
            model_name="relay",
            name="imap_host",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="relay",
            name="provider",
            field=models.CharField(default="stalwart", max_length=32),
        ),
        migrations.AddField(
            model_name="relay",
            name="provider_domain_id",
            field=models.CharField(blank=True, max_length=128),
        ),
        migrations.AddField(
            model_name="relay",
            name="registration_open",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="relay",
            name="smtp_host",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="relay",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name="relayaccount",
            name="failure_code",
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name="relayaccount",
            name="failure_message",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="relayaccount",
            name="owner",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="relay_accounts", to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name="relayaccount",
            name="provider",
            field=models.CharField(default="stalwart", max_length=32),
        ),
        migrations.AddField(
            model_name="relayaccount",
            name="provisioned_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="relayaccount",
            name="relay",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="accounts", to="registration.relay"),
        ),
        migrations.AddField(
            model_name="relayaccount",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name="relayaccount",
            name="provisioning_status",
            field=models.CharField(choices=[("pending", "در انتظار"), ("active", "فعال"), ("failed", "ناموفق"), ("suspended", "تعلیق‌شده"), ("deleting", "در حال حذف"), ("deleted", "حذف‌شده")], default="pending", max_length=20),
        ),
        migrations.RunPython(mark_legacy_accounts_active, migrations.RunPython.noop),
        migrations.AddIndex(
            model_name="relayaccount",
            index=models.Index(fields=["owner", "provisioning_status"], name="reg_owner_status_idx"),
        ),
    ]
