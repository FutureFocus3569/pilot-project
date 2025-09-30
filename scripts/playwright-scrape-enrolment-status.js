// playwright-scrape-enrolment-status.js
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

// ...scrapeCurrentChildrenCount, scrapeFutureChildrenCount, scrapeWaitingChildrenCount, scrapeEnquiryChildrenCount functions copied from original script...

// (Functions omitted for brevity, will be copied in next step)

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

      // Save to OccupancyData for today
      const today = new Date();
      await prisma.occupancyData.upsert({
        where: {
          centreId_date: {
            centreId: centre.id,
            date: today,
          },
        },
        update: {
          currentChildren: currentCount,
          futureChildren: futureCount,
          waitingChildren: waitingCount,
          enquiryChildren: enquiryCount,
        },
        create: {
          centreId: centre.id,
          date: today,
          currentChildren: currentCount,
          futureChildren: futureCount,
          waitingChildren: waitingCount,
          enquiryChildren: enquiryCount,
          u2Count: 0,
          o2Count: 0,
          totalCount: 0,
        },
      });
    } catch (e) {
      console.error(`Error scraping ${centre.name}:`, e);
    }
    await page.close();
  }
  await browser.close();
  await prisma.$disconnect();
})();
