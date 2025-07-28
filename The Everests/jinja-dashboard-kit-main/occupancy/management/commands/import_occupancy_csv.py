import csv
from django.core.management.base import BaseCommand
from occupancy.models import Centre, Occupancy

class Command(BaseCommand):
    help = 'Import occupancy data from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']
        with open(csv_file, newline='') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                # Handle possible whitespace and case issues in header
                centre_name = row.get('centreName') or row.get('\ufeffcentreName') or row.get('centreName '.strip()) or row.get('centreName'.strip())
                api_id = row.get('apiId')
                month_year = row.get('month') or row.get('Month')
                u2 = row.get('u2') or row.get('U2')
                o2 = row.get('o2') or row.get('O2')
                total = row.get('total') or row.get('Total')
                if not all([centre_name, month_year, u2, o2, total]):
                    self.stdout.write(self.style.WARNING(f'Skipped row due to missing data: {row}'))
                    continue
                centre, created = Centre.objects.get_or_create(name=centre_name.strip())
                if api_id:
                    centre.api_id = api_id.strip()
                    centre.save()
                occ, created = Occupancy.objects.get_or_create(
                    centre=centre,
                    month_year=month_year.strip(),
                    defaults={'u2': int(u2), 'o2': int(o2), 'total': int(total)}
                )
                if not created:
                    occ.u2 = int(u2)
                    occ.o2 = int(o2)
                    occ.total = int(total)
                    occ.save()
                count += 1
        self.stdout.write(self.style.SUCCESS(f'Imported {count} occupancy records.'))
