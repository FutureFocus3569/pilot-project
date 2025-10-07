# Childcare Admin Dashboard

This Django project provides an admin interface for managing occupancy data for childcare centres. It includes:
- Django admin for easy data entry and management
- Models for Centre and Occupancy
- API endpoints for dashboard integration

## Getting Started
1. Install dependencies: `pip install django djangorestframework`
2. Run migrations: `python manage.py migrate`
3. Create a superuser: `python manage.py createsuperuser`
4. Start the server: `python manage.py runserver`
5. Access the admin at `http://localhost:8000/admin`

## Next Steps
- Add your centres and occupancy data via the admin
- Use the API to connect your dashboard frontend
