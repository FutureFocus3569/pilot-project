from django.core.management.base import BaseCommand
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import os

class Command(BaseCommand):
    help = 'Scrape overdue invoice amounts from Discover Childcare'

    def handle(self, *args, **options):
        chrome_options = Options()
        # chrome_options.add_argument('--headless')  # Disable headless for debugging
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        from occupancy.models import Centre
        centres = Centre.objects.all()

        for centre in centres:
            print(f"Scraping centre: {centre.name} ({centre.api_id})")
            driver = webdriver.Chrome(options=chrome_options)
            try:
                # Login
                driver.get('https://discoverchildcare.co.nz/Account/Login')
                time.sleep(2)
                email = os.environ.get('DISCOVER_EMAIL')
                password_val = os.environ.get('DISCOVER_PASSWORD')
                if not email or not password_val:
                    print('Please set DISCOVER_EMAIL and DISCOVER_PASSWORD environment variables.')
                    driver.quit()
                    continue
                email_input = driver.find_element(By.ID, 'Email')
                password_input = driver.find_element(By.ID, 'Password')
                email_input.send_keys(email)
                password_input.send_keys(password_val)
                driver.find_element(By.XPATH, "//button[@type='submit']").click()
                time.sleep(5)  # Wait extra for dashboard

                # Go to centre dashboard
                dashboard_url = f"https://discoverchildcare.co.nz/{centre.api_id}/Home"
                driver.get(dashboard_url)
                time.sleep(3)
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
                time.sleep(2)

                try:
                    label = driver.find_element(By.XPATH, "//h5[contains(text(), 'Overdue invoices amount')]")
                    parent_div = label.find_element(By.XPATH, "../../..")
                    amount_elem = parent_div.find_element(By.XPATH, ".//h1[@class='no-margins']")
                    centre.overdue_invoice_amount = amount_elem.text
                    centre.save()
                    print(f"{centre.name} Overdue Invoice Amount saved:", amount_elem.text)
                except Exception as e:
                    print(f"{centre.name}: Could not find overdue invoice amount:", e)
            finally:
                driver.quit()
