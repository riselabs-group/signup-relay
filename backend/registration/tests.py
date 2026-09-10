import os
from rest_framework.test import APITestCase
class SignupTests(APITestCase):
 def test_success_and_duplicate(self):
  p={'username':'nora','password':'a-very-strong-pass','password_confirmation':'a-very-strong-pass','accept_terms':True}
  r=self.client.post('/api/signup/',p,format='json'); self.assertEqual(r.status_code,201); self.assertEqual(r.data['email'],'nora@rise.example')
  self.assertEqual(self.client.post('/api/signup/',p,format='json').status_code,400)
 def test_invalid_password(self):
  r=self.client.post('/api/signup/',{'username':'abc','password':'short','password_confirmation':'short','accept_terms':True},format='json'); self.assertEqual(r.status_code,400)
