const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Create mock data inside the page before loading UI? 
  // No, let's just intercept the API request and mock it!
  await page.setRequestInterception(true);
  page.on('request', request => {
      if (request.url().includes('script.google.com')) {
          request.respond({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                  status: 'success',
                  roster: [
                      { role: 'TRAINEE', name: 'CHUA WEE LING JOANNE', shortName: 'JOANNE', nric: 'S1234567A', group: 'WEST END & RSPID (WGS)' },
                      { role: 'CAREGIVER', name: 'CHUA HO', shortName: '', nric: 'S1234567B', group: 'WEST END & RSPID (WGS)', relatedTrainee: 'S1234567A' }
                  ]
              })
          });
      } else {
          request.continue();
      }
  });

  await page.goto('http://localhost:3000/roster.html', { waitUntil: 'networkidle0' });
  
  const content = await page.evaluate(() => {
    return document.getElementById('rosterTableBody').innerText;
  });
  console.log('TABLE CONTENT:', content);
  
  const html = await page.evaluate(() => {
    return document.getElementById('rosterTableBody').innerHTML;
  });
  console.log('TABLE HTML:', html.slice(0, 1500));
  
  await browser.close();
})();
