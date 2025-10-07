from django.db import models
from django.db import models

# Budget model for Xero categories
class Budget(models.Model):
    xero_account_code = models.CharField(max_length=20, blank=True, null=True, help_text="Xero Chart of Account code for this budget line")
    centre = models.ForeignKey('Centre', on_delete=models.CASCADE, related_name='budgets')
    CATEGORY_CHOICES = [
        ("Cleaning Supplies", "Cleaning Supplies"),
        ("First Aid", "First Aid"),
        ("Food Costs", "Food Costs"),
        ("Kiri Classroom Resources", "Kiri Classroom Resources"),
        ("Wai Classroom Resources", "Wai Classroom Resources"),
        ("Nga Classroom Resources", "Nga Classroom Resources"),
        ("Te Hui Classroom Resources", "Te Hui Classroom Resources"),
        ("Centre Purcahses", "Centre Purcahses"),
        ("Printing and Stationary", "Printing and Stationary"),
        ("Art and Messy Play", "Art and Messy Play"),
        ("Meeting Costs", "Meeting Costs"),
        ("Nappies and Wipes", "Nappies and Wipes"),
        ("Repairs and Maintenance", "Repairs and Maintenance"),
    ]
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES)
    year = models.PositiveIntegerField()
    monthly_budget = models.DecimalField(max_digits=10, decimal_places=2, help_text="Default monthly budget")
    # Optional: allow per-month overrides
    jan = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    feb = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    mar = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    apr = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    may = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    jun = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    jul = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    aug = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    sep = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    oct = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    nov = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    dec = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    class Meta:
        unique_together = ("centre", "category", "year")
        ordering = ["category", "year"]

    def __str__(self):
        return f"{self.centre} - {self.category} - {self.year}"

class Centre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    api_id = models.CharField(max_length=50, blank=True, null=True, unique=True, help_text="Discover API ID")
    moe_number = models.CharField(max_length=50, blank=True, null=True, help_text="MOE Number")
    u2_licensed = models.PositiveIntegerField(blank=True, null=True, help_text="Licensed U2 children")
    total_licensed = models.PositiveIntegerField(blank=True, null=True, help_text="Licensed Total children")
    nzbn = models.CharField("NZBN", max_length=20, blank=True, null=True, help_text="New Zealand Business Number for this centre/company.")
    overdue_invoice_amount = models.CharField(max_length=32, blank=True, null=True)

    def __str__(self):
        return self.name

class Occupancy(models.Model):
    centre = models.ForeignKey(Centre, on_delete=models.CASCADE)
    month_year = models.CharField(max_length=7)  # Format: MM-YYYY
    u2 = models.PositiveSmallIntegerField(help_text="U2 occupancy percentage")
    o2 = models.PositiveSmallIntegerField(help_text="O2 occupancy percentage")
    total = models.PositiveSmallIntegerField(help_text="Total occupancy percentage")

    class Meta:
        unique_together = ('centre', 'month_year')
        ordering = ['-month_year']

    def __str__(self):
        return f"{self.centre.name} - {self.month_year}"
