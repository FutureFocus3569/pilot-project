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

  for (const centre of CENTRES) {
    try {
      const amount = await scrapeOverdueAmount(page, centre.discoverApiId);
      if (amount !== null) {
        // Try to update by discoverApiId if your DB has it, else fallback to name
        const updated = await prisma.centre.updateMany({
          where: { name: centre.name },
          data: { overdueInvoicesAmount: amount },
        });
        if (updated.count > 0) {
          console.log(`${centre.name}: $${amount} updated.`);
        } else {
          console.log(`${centre.name}: No matching centre in DB.`);
        }
      } else {
        console.log(`${centre.name}: Could not find overdue amount.`);
      }
    } catch (e) {
      console.error(`Error for ${centre.name}:`, e);
    }
  }

  await browser.close();
  await prisma.$disconnect();
})();
