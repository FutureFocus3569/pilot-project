// Scrape the total number of 'Waiting' children for Papamoa Beach
async function scrapeWaitingChildrenCount(page) {
  // Untick 'Future' by clicking its label (if checked)
  const futureChecked = await page.isChecked('input[type="checkbox"][name="Future"]');
  if (futureChecked) {
    await page.click('label[for="Future"]');
    await page.waitForTimeout(500);
  }
  // Tick 'Waiting' by clicking its label (if not checked)
  const waitingChecked = await page.isChecked('input[type="checkbox"][name="Waiting"]');
  if (!waitingChecked) {
    await page.click('label[for="Waiting"]');
    await page.waitForTimeout(500);
  }
  // Wait for the info text to disappear and reappear
  await page.waitForSelector('.dataTables_info', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForSelector('.dataTables_info', { timeout: 5000 });
  // Extract the total from the info text (with retry)
  let total = null;
  for (let i = 0; i < 5; i++) {
    total = await page.evaluate(() => {
      const info = document.querySelector('.dataTables_info');
      if (!info) return null;
      const match = info.textContent && info.textContent.match(/of (\d+) entries/);
      return match ? parseInt(match[1], 10) : null;
    });
    if (total !== null) break;
    await page.waitForTimeout(500);
  }
  return total;
}

// Scrape the total number of 'Enquiry' children for Papamoa Beach
async function scrapeEnquiryChildrenCount(page) {
  // Untick 'Waiting' by clicking its label (if checked)
  const waitingChecked = await page.isChecked('input[type="checkbox"][name="Waiting"]');
  if (waitingChecked) {
    await page.click('label[for="Waiting"]');
    await page.waitForTimeout(500);
  }
  // Tick 'Enquiry' by clicking its label (if not checked)
  const enquiryChecked = await page.isChecked('input[type="checkbox"][name="Enquiry"]');
  if (!enquiryChecked) {
    await page.click('label[for="Enquiry"]');
    await page.waitForTimeout(500);
  }
  // Wait for the info text to disappear and reappear
  await page.waitForSelector('.dataTables_info', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForSelector('.dataTables_info', { timeout: 5000 });
  // Extract the total from the info text (with retry)
  let total = null;
  for (let i = 0; i < 5; i++) {
    total = await page.evaluate(() => {
      const info = document.querySelector('.dataTables_info');
      if (!info) return null;
      const match = info.textContent && info.textContent.match(/of (\d+) entries/);
      return match ? parseInt(match[1], 10) : null;
    });
    if (total !== null) break;
    await page.waitForTimeout(500);
  }
  return total;
}
// Scrape the total number of 'Future' children for Papamoa Beach
async function scrapeFutureChildrenCount(page, discoverApiId) {
  // Assumes already on the Child page after scraping 'Current'.
  // Go to the filter section and untick 'Current', tick 'Future'.
  // Wait for the filter section to be visible
  await page.waitForSelector('label[for="Current"]');
  // Untick 'Current' by clicking its label (if checked)
  const currentChecked = await page.isChecked('input[type="checkbox"][name="Current"]');
  if (currentChecked) {
    await page.click('label[for="Current"]');
    await page.waitForTimeout(500); // Wait for UI to update
  }
  // Tick 'Future' by clicking its label (if not checked)
  const futureChecked = await page.isChecked('input[type="checkbox"][name="Future"]');
  if (!futureChecked) {
    await page.click('label[for="Future"]');
    await page.waitForTimeout(500); // Wait for UI to update
  }
  // Wait for the info text to disappear (table reload) and then reappear
  await page.waitForSelector('.dataTables_info', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForSelector('.dataTables_info', { timeout: 5000 });
  // Extract the total from the info text (with retry)
  let total = null;
  for (let i = 0; i < 5; i++) {
    total = await page.evaluate(() => {
      const info = document.querySelector('.dataTables_info');
      if (!info) return null;
      const match = info.textContent && info.textContent.match(/of (\d+) entries/);
      return match ? parseInt(match[1], 10) : null;
    });
    if (total !== null) break;
    await page.waitForTimeout(500);
  }
  return total;
}
// Scrape the total number of 'Current' children for Papamoa Beach
async function scrapeCurrentChildrenCount(page, discoverApiId) {
  const url = `https://discoverchildcare.co.nz/${discoverApiId}/Child`;
  await page.goto(url);
  // Ensure only 'Current' is checked (uncheck others)
  await page.waitForSelector('input[type="checkbox"][name="Current"]');
  // Uncheck all except 'Current'
  const filters = ['Future', 'Waiting', 'Enquiry', 'Past'];
  for (const filter of filters) {
    const selector = `input[type="checkbox"][name="${filter}"]`;
    if (await page.isChecked(selector)) {
      await page.click(selector);
    }
  }
  // Make sure 'Current' is checked
  const currentSelector = 'input[type="checkbox"][name="Current"]';
  if (!(await page.isChecked(currentSelector))) {
    await page.click(currentSelector);
  }
  // Wait for the table to update (wait for the info text to appear)
  await page.waitForSelector('.dataTables_info', { timeout: 5000 });
  // Extract the total from the info text (with retry)
  let total = null;
  for (let i = 0; i < 5; i++) {
    total = await page.evaluate(() => {
      const info = document.querySelector('.dataTables_info');
      if (!info) return null;
      const match = info.textContent && info.textContent.match(/of (\d+) entries/);
      return match ? parseInt(match[1], 10) : null;
    });
    if (total !== null) break;
    await page.waitForTimeout(500);
  }
  return total;
}
// playwright-scrape-overdue.js
// Script to log in to Discover Childcare, scrape overdue invoices for each centre, and update the DB
// Usage: node playwright-scrape-overdue.js

const { chromium } = require('playwright');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const LOGIN_URL = 'https://discoverchildcare.co.nz/Account/Login';
const CENTRES = [
  { name: 'Papamoa Beach', id: 'papamoa-beach', discoverApiId: '820b4c7b-b24e-464f-9d08-a83f273368ac' },
  { name: 'The Boulevard', id: 'the-boulevard', discoverApiId: 'f1c30c4f-9e6c-4d7c-bc4e-9d88f54749ea' },
  { name: 'The Bach', id: 'the-bach', discoverApiId: '348d7f06-ab28-4853-9c61-032c9ff1ad22' },
  { name: 'Terrace Views', id: 'terrace-views', discoverApiId: '1fd6e115-da26-4838-a78d-4804a59e5a94' },
  { name: 'Livingstone Drive', id: 'livingstone-drive', discoverApiId: '73668a22-78b9-4b92-b7d0-2e1aaae62f90' },
  { name: 'West Dune', id: 'west-dune', discoverApiId: '280b9833-9ebf-41d9-9ab9-c4c91c6861b0' },
];

const USERNAME = process.env.DISCOVER_USERNAME || 'courtney@futurefocus.co.nz';
const PASSWORD = process.env.DISCOVER_PASSWORD || 'Mercedes2!!!';

async function scrapeOverdueAmount(page, discoverApiId) {
  const url = `https://discoverchildcare.co.nz/${discoverApiId}/Home`;
  await page.goto(url);
  // Wait for the AgedDebtors link and the h1.no-margins to appear
  await page.waitForSelector('a[href*="/Reports/AgedDebtors"] h1.no-margins');
  const overdueAmount = await page.evaluate(() => {
    // Find the <a> with /Reports/AgedDebtors in href
    const agedDebtorsLink = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('/Reports/AgedDebtors'));
    if (!agedDebtorsLink) return null;
    // The h1.no-margins is a child of the <a>
    const h1 = agedDebtorsLink.querySelector('h1.no-margins');
    if (!h1) return null;
    const match = h1.textContent && h1.textContent.match(/\$([\d,.]+)/);
    return match ? parseFloat(match[1].replace(/,/g, '')) : null;
  });
  return overdueAmount;
}


(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(LOGIN_URL);
  await page.fill('input[name="Email"]', USERNAME);
  await page.fill('input[name="Password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // Scrape enrolment status counts for all centres
  for (const centre of CENTRES) {
    try {
      const currentCount = await scrapeCurrentChildrenCount(page, centre.discoverApiId);
      console.log(`${centre.name} - Current Children: ${currentCount}`);
      const futureCount = await scrapeFutureChildrenCount(page, centre.discoverApiId);
      console.log(`${centre.name} - Future Children: ${futureCount}`);
      const waitingCount = await scrapeWaitingChildrenCount(page);
      console.log(`${centre.name} - Waiting Children: ${waitingCount}`);
      const enquiryCount = await scrapeEnquiryChildrenCount(page);
      console.log(`${centre.name} - Enquiry Children: ${enquiryCount}`);
    } catch (e) {
      console.error(`Error scraping ${centre.name}:`, e);
    }
  }

  // ...existing code for overdue invoices...

  await browser.close();
  await prisma.$disconnect();
})();
