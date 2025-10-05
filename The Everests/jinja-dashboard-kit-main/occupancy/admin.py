from django.contrib import admin
from .models import Centre, Occupancy, Budget

# Budget admin
@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ("centre", "category", "year", "xero_account_code", "monthly_budget", "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec")
    list_filter = ("centre", "category", "year")
    search_fields = ("category",)

@admin.register(Centre)
class CentreAdmin(admin.ModelAdmin):
    list_display = ('name', 'api_id', 'moe_number', 'u2_licensed', 'total_licensed', 'nzbn')

    fieldsets = (
        (None, {
            'fields': ('name', 'api_id', 'moe_number', 'u2_licensed', 'total_licensed', 'nzbn'),
        }),
    )

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if 'api_id' in form.base_fields:
            form.base_fields['api_id'].label = 'Discover API'
        return form

@admin.register(Occupancy)
class OccupancyAdmin(admin.ModelAdmin):
    list_display = ('centre', 'month_year', 'u2', 'o2', 'total')
    list_filter = ('centre', 'month_year')
