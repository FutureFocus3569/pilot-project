"""
URL configuration for childcare_admin project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.shortcuts import render
from app.ai_agent_api import AIChatView
from occupancy.views import OccupancyByMonthView, OverdueInvoicesView, BudgetListView, xero_login, xero_callback, XeroActualsView

def home(request):
    return HttpResponse("Welcome to the homepage!")

def dashboard(request):
    return render(request, "home/index.html")

# Xero dashboard page view
def xero_dashboard(request):
    return render(request, "home/xero.html")
    
# AI Agent page view
def ai_agent(request):
    return render(request, "home/ai-agent.html")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/occupancy/', OccupancyByMonthView.as_view(), name='occupancy-by-month'),
    path('api/overdue-invoices/', OverdueInvoicesView.as_view(), name='overdue-invoices'),
    path('api/budgets/', BudgetListView.as_view(), name='budget-list'),
    path('', dashboard, name='dashboard'),
    path('xero/', xero_dashboard, name='xero_dashboard'),
    path('ai-agent/', ai_agent, name='ai_agent'),
    path('api/ai-agent-chat/', AIChatView.as_view(), name='ai_agent_chat'),
    path('xero/login/', xero_login, name='xero_login'),
    path('xero/callback/', xero_callback, name='xero_callback'),
    path('api/xero-actuals/', XeroActualsView.as_view(), name='xero-actuals'),
    path('accounts/', include('django.contrib.auth.urls')),  # Add Django auth URLs
]
