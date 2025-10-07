from django.core.management.base import BaseCommand
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

class Command(BaseCommand):
    help = 'Scrape overdue invoice amounts from Discover Childcare'

    def handle(self, *args, **options):
        import os
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        driver = webdriver.Chrome(options=chrome_options)

        try:
            # Use correct login URL
            driver.get('https://discoverchildcare.co.nz/Account/Login')
            time.sleep(2)

            # Get credentials from environment variables
            email = os.environ.get('DISCOVER_EMAIL')
            password_val = os.environ.get('DISCOVER_PASSWORD')
            if not email or not password_val:
                print('Please set DISCOVER_EMAIL and DISCOVER_PASSWORD environment variables.')
                driver.quit()
                return

            # Update selectors for login form
            email_input = driver.find_element(By.ID, 'Email')
            password_input = driver.find_element(By.ID, 'Password')
            email_input.send_keys(email)
            password_input.send_keys(password_val)
            driver.find_element(By.XPATH, "//button[@type='submit']").click()
            time.sleep(3)

            # TODO: Navigate to overdue invoices page and scrape data
            # driver.get('https://discoverchildcare.co.nz/overdue-invoices')
            # ti            heroku login.sleep(2)

            # Example: Find invoice amounts (update selector as needed)
            # amounts = driver.find_elements(By.CLASS_NAME, 'invoice-amount')
            # for amt in amounts:
            #     print('Overdue Invoice:', amt.text)

            # TODO: Save data to your Django model
        finally:
            driver.quit()
