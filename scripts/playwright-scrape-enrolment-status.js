Success. No rows returned// playwright-scrape-enrolment-status.js
// Script to log in to Discover Childcare, scrape enrolment status for each centre, and update the DB
// Usage: node playwright-scrape-enrolment-status.js

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


// Scrape the total number of 'Current' children
async function scrapeCurrentChildrenCount(page, discoverApiId) {
  const url = `https://discoverchildcare.co.nz/${discoverApiId}/Child`;
  await page.goto(url);
  await page.waitForSelector('#processing-modal', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForSelector('input[type="checkbox"][name="Current"]');
  const filters = ['Future', 'Waiting', 'Enquiry', 'Past'];
  for (const filter of filters) {
    const selector = `input[type="checkbox"][name="${filter}"]`;
    if (await page.isChecked(selector)) {
      await page.waitForSelector('#processing-modal', { state: 'detached', timeout: 10000 }).catch(() => {});
      await page.click(`label[for="${filter}"]`);
    }
  }
  const currentSelector = 'input[type="checkbox"][name="Current"]';
  if (!(await page.isChecked(currentSelector))) {
    await page.waitForSelector('#processing-modal', { state: 'detached', timeout: 10000 }).catch(() => {});
    await page.click('label[for="Current"]');
  }
  await page.waitForSelector('.dataTables_info', { timeout: 5000 });
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

// Scrape the total number of 'Future' children
async function scrapeFutureChildrenCount(page, discoverApiId) {
  const url = `https://discoverchildcare.co.nz/${discoverApiId}/Child`;
  await page.goto(url);
  await page.waitForSelector('input[type="checkbox"][name="Future"]', { timeout: 10000 });
  const filters = ['Current', 'Waiting', 'Enquiry', 'Past'];
  for (const filter of filters) {
    const selector = `input[type="checkbox"][name="${filter}"]`;
    if (await page.isChecked(selector)) {
      await page.waitForSelector('#processing-modal', { state: 'detached', timeout: 10000 }).catch(() => {});
      await page.click(`label[for="${filter}"]`);
      await page.waitForTimeout(300);
    }
  }
  const futureSelector = 'input[type="checkbox"][name="Future"]';
  if (!(await page.isChecked(futureSelector))) {
    await page.waitForSelector('#processing-modal', { state: 'detached', timeout: 10000 }).catch(() => {});
    await page.click('label[for="Future"]');
    await page.waitForTimeout(500);
  }
  await page.waitForSelector('.dataTables_info', { state: 'detached', timeout: 10000 }).catch(() => {});
  let appeared = false;
  try {
    await page.waitForSelector('.dataTables_info', { timeout: 10000 });
    appeared = true;
  } catch (err) {
    await page.reload();
    await page.waitForSelector('input[type="checkbox"][name="Future"]', { timeout: 10000 });
    for (const filter of filters) {
      const selector = `input[type="checkbox"][name="${filter}"]`;
      if (await page.isChecked(selector)) {
        await page.waitForSelector('#processing-modal', { state: 'detached', timeout: 10000 }).catch(() => {});
        await page.click(`label[for="${filter}"]`);
        await page.waitForTimeout(300);
      }
    }
    if (!(await page.isChecked(futureSelector))) {
      await page.waitForSelector('#processing-modal', { state: 'detached', timeout: 10000 }).catch(() => {});
      await page.click('label[for="Future"]');
      await page.waitForTimeout(500);
    }
    try {
      await page.waitForSelector('.dataTables_info', { timeout: 10000 });
      appeared = true;
    } catch (err2) {
      return 0;
    }
  }
  let total = null;
  if (appeared) {
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
  }
  return total;
}

// Scrape the total number of 'Waiting' children
async function scrapeWaitingChildrenCount(page) {
  const waitingChecked = await page.isChecked('input[type="checkbox"][name="Waiting"]');
  if (!waitingChecked) {
    await page.click('label[for="Waiting"]');
    await page.waitForTimeout(500);
  }
  await page.waitForSelector('.dataTables_info', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForSelector('.dataTables_info', { timeout: 5000 });
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

// Scrape the total number of 'Enquiry' children
async function scrapeEnquiryChildrenCount(page) {
  const enquiryChecked = await page.isChecked('input[type="checkbox"][name="Enquiry"]');
  if (!enquiryChecked) {
    await page.click('label[for="Enquiry"]');
    await page.waitForTimeout(500);
  }
  await page.waitForSelector('.dataTables_info', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForSelector('.dataTables_info', { timeout: 5000 });
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

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const centre of CENTRES) {
    const page = await browser.newPage();
    try {
      await page.goto(LOGIN_URL);
      await page.fill('input[name="Email"]', USERNAME);
      await page.fill('input[name="Password"]', PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      const currentCount = await scrapeCurrentChildrenCount(page, centre.discoverApiId);
      const futureCount = await scrapeFutureChildrenCount(page, centre.discoverApiId);
      const waitingCount = await scrapeWaitingChildrenCount(page);
      const enquiryCount = await scrapeEnquiryChildrenCount(page);

      console.log(`${centre.name} - Current Children: ${currentCount}`);
      console.log(`${centre.name} - Future Children: ${futureCount}`);
      console.log(`${centre.name} - Waiting Children: ${waitingCount}`);
      console.log(`${centre.name} - Enquiry Children: ${enquiryCount}`);

      // Save to enrolment_status for today
      const today = new Date();
      try {
        const result = await prisma.enrolment_status.upsert({
          where: {
            centre_id_date: {
              centre_id: centre.name,
              date: today,
            },
          },
          update: {
            current: currentCount,
            future: futureCount,
            waiting: waitingCount,
            enquiry: enquiryCount,
          },
          create: {
            centre_id: centre.name,
            date: today,
            current: currentCount,
            future: futureCount,
            waiting: waitingCount,
            enquiry: enquiryCount,
          },
        });
        console.log(`Upserted enrolment status for ${centre.name}:`, result);
      } catch (err) {
        console.error(`Error upserting enrolment status for ${centre.name}:`, err);
      }
    } catch (e) {
      console.error(`Error scraping ${centre.name}:`, e);
    }
    await page.close();
  }
  await browser.close();
  await prisma.$disconnect();
})();
