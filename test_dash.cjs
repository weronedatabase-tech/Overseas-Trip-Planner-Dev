const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  // mock user session
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('userSession', JSON.stringify({ nric: 'test', role: 'member', name: 'Test' }));
  });

  await page.goto('http://localhost:3000/dashboard.html', { waitUntil: 'networkidle0' });
  console.log('Finished loading dashboard');
  
  await browser.close();
})();
