from django.db import models

class Centre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    api_id = models.CharField(max_length=50, blank=True, null=True, unique=True, help_text="Discover API ID")
    moe_number = models.CharField(max_length=50, blank=True, null=True, help_text="MOE Number")
    u2_licensed = models.PositiveIntegerField(blank=True, null=True, help_text="Licensed U2 children")
    total_licensed = models.PositiveIntegerField(blank=True, null=True, help_text="Licensed Total children")

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
