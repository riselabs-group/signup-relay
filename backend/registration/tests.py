import os
from django.utils import timezone
from rest_framework.test import APITestCase
from .models import BlogPost
class SignupTests(APITestCase):
 def test_success_and_duplicate(self):
  p={'username':'nora','password':'a-very-strong-pass','password_confirmation':'a-very-strong-pass','accept_terms':True}
  r=self.client.post('/api/signup/',p,format='json'); self.assertEqual(r.status_code,201); self.assertEqual(r.data['email'],'nora@rise.example')
  self.assertEqual(self.client.post('/api/signup/',p,format='json').status_code,400)
 def test_invalid_password(self):
  r=self.client.post('/api/signup/',{'username':'abc','password':'short','password_confirmation':'short','accept_terms':True},format='json'); self.assertEqual(r.status_code,400)

class BlogTests(APITestCase):
 def test_only_published_posts_are_public(self):
  BlogPost.objects.create(title='Published',slug='published',excerpt='Visible',content='Body',published=True,published_at=timezone.now())
  BlogPost.objects.create(title='Draft',slug='draft',excerpt='Hidden',content='Body',published=False)
  response=self.client.get('/api/blog/')
  self.assertEqual(response.status_code,200)
  titles={post['title'] for post in response.data}
  self.assertIn('Published',titles); self.assertNotIn('Draft',titles)
