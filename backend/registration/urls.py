from django.urls import path

from . import views


urlpatterns = [
    path("", views.api_index),
    path("config/", views.config),
    path("blog/", views.blog),
    path("altcha/challenge/", views.altcha_challenge),
    path("username/<str:value>/", views.username),
    # Existing public relay flow; preserved for the current React site.
    path("signup/", views.signup),
    # Product identity.
    path("auth/register/", views.auth_register),
    path("auth/login/", views.auth_login),
    path("auth/logout/", views.auth_logout),
    path("me/", views.me),
    # Business mailbox lifecycle.
    path("domains/", views.domains),
    path("mailboxes/", views.mailboxes),
    path("mailboxes/<int:mailbox_id>/", views.mailbox_detail),
    path("mailboxes/<int:mailbox_id>/password/", views.mailbox_password),
    path("mailboxes/<int:mailbox_id>/suspend/", views.mailbox_suspend),
    path("mailboxes/<int:mailbox_id>/resume/", views.mailbox_resume),
    path("mailboxes/<int:mailbox_id>/delete/", views.mailbox_delete),
]
