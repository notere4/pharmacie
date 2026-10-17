"""
URL configuration for medstock_project project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import TokenRefreshView
from inventory.auth import CustomTokenObtainPairView, MeView
from django.views.generic import TemplateView  # 🔥 مهم

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('inventory.urls')),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/me/', MeView.as_view(), name='me'),
     # React frontend (root)
    re_path(r"^.*$", TemplateView.as_view(template_name="index.html")),
]
