const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');
const config = require('./config');

const PORT = 3030;
let localServer = null;

/**
 * Searches standard Windows installations to find Microsoft Edge (msedge.exe).
 */
function getEdgePath() {
  const commonPaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft\\Edge\\Application\\msedge.exe')
  ];
  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

/**
 * Extracts YouTube video ID from watch or Shorts URL.
 */
function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|shorts\/|watch\?v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match ? match[1] : null;
}

/**
 * Generates the local HTML grid dashboard containing 50 embeds.
 */
function generateGridHtml(url, count = 50) {
  const videoId = extractVideoId(url);
  // Configure autoplay, mute, and loop parameters for the iframe embed
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}`
    : url;

  let iframes = '';
  for (let i = 0; i < count; i++) {
    iframes += `<iframe src="${embedUrl}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>\n`;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Multi-Screen Video Dashboard</title>
  <style>
    body {
      margin: 0;
      padding: 15px;
      background-color: #0b0b0b;
      color: #eaeaea;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      box-sizing: border-box;
      width: 100vw;
      height: 100vh;
      overflow-x: hidden;
      overflow-y: auto;
    }
    .header {
      margin-bottom: 15px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 1px;
      color: #ff3b30;
      text-transform: uppercase;
      text-shadow: 0 0 10px rgba(255, 59, 48, 0.3);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      gap: 12px;
      padding-bottom: 20px;
    }
    iframe {
      width: 100%;
      aspect-ratio: 9 / 16;
      border: 2px solid #222;
      border-radius: 6px;
      background-color: #000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
    }
    iframe:hover {
      border-color: #ff3b30;
      transform: scale(1.03);
      box-shadow: 0 6px 12px rgba(255, 59, 48, 0.2);
    }
    /* Responsive adjustment for small screens */
    @media (max-width: 1200px) {
      .grid {
        grid-template-columns: repeat(5, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="header">Multi-Screen Monitor Grid (50 active elements)</div>
  <div class="grid">
    ${iframes}
  </div>
</body>
</html>
  `;
}

/**
 * Starts a background HTTP server to serve the local dashboard grid.
 */
function startLocalServer(url) {
  if (localServer) return;
  localServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(generateGridHtml(url, 50));
  });
  localServer.listen(PORT, '127.0.0.1', () => {
    console.log(`Local web server running at http://127.0.0.1:${PORT}/`);
  });
}

/**
 * Simulates mouse sweeps to mimic user presence on the grid dashboard.
 */
async function moveMouseRandomly(page) {
  try {
    const width = await page.evaluate(() => window.innerWidth);
    const height = await page.evaluate(() => window.innerHeight);

    const startX = Math.floor(Math.random() * (width / 2));
    const startY = Math.floor(Math.random() * (height / 2));
    const targetX = Math.floor(Math.random() * (width - 100)) + 50;
    const targetY = Math.floor(Math.random() * (height - 100)) + 50;

    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      let currentX = Math.floor(startX + (targetX - startX) * t);
      let currentY = Math.floor(startY + (targetY - startY) * t);

      currentX += Math.floor((Math.random() - 0.5) * 6);
      currentY += Math.floor((Math.random() - 0.5) * 6);

      await page.mouse.move(
        Math.max(0, Math.min(width, currentX)),
        Math.max(0, Math.min(height, currentY))
      );
      await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 15));
    }
  } catch (error) {
    // Fail silently since mouse movements are simulation details
  }
}

/**
 * Controller loop managing the single browser window and the multi-screen page.
 */
async function main() {
  console.log('----------------------------------------------------');
  console.log('Starting Microsoft Edge Single-Page Multi-Screen Controller');
  console.log('Target: 50 active screens on one page');
  console.log(`Target URL: ${config.urls[0]}`);
  console.log('----------------------------------------------------');

  // Start HTTP Server to host the embedding context
  startLocalServer(config.urls[0]);

  let browser = null;

  while (true) {
    try {
      if (!browser || !browser.connected) {
        const edgePath = getEdgePath();
        if (edgePath) {
          console.log(`Using Microsoft Edge at: ${edgePath}`);
        } else {
          console.log('Microsoft Edge not detected. Falling back to default Chromium.');
        }

        const args = [
          '--autoplay-policy=no-user-gesture-required',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-client-side-phishing-detection',
          '--disable-default-apps',
          '--disable-dev-shm-usage',
          '--disable-infobars',
          '--disable-popup-blocking',
          '--disable-prompt-on-repost',
          '--disable-renderer-backgrounding',
          '--disable-sync',
          '--metrics-recording-only',
          '--no-first-run',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--start-maximized', // Launch with a maximized window to display the grid clearly
        ];

        // Apply primary proxy globally if configured
        if (config.proxies && config.proxies.length > 0) {
          const proxyString = config.proxies[0];
          let proxyHost = proxyString;
          try {
            const parsed = new URL(proxyString);
            proxyHost = `${parsed.protocol}//${parsed.host}`;
          } catch (e) {}
          args.push(`--proxy-server=${proxyHost}`);
          console.log(`Configuring shared browser proxy: ${proxyHost}`);
        }

        browser = await puppeteer.launch({
          headless: config.puppeteer.headless,
          executablePath: edgePath || config.puppeteer.executablePath || undefined,
          args: args,
          defaultViewport: null // Use actual system viewport size
        });

        const pages = await browser.pages();
        const page = pages.length > 0 ? pages[0] : await browser.newPage();

        console.log('Loading 50-screen layout from local server...');
        await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 90000 });

        console.log('Layout loaded successfully. Simulating user presence...');

        // Nested presence loop keeping the page active as long as the browser is connected
        while (browser.connected) {
          try {
            await moveMouseRandomly(page);
            // Simulate scrolling up and down the grid
            const scrollDirection = Math.random() > 0.5 ? 100 : -100;
            await page.evaluate((y) => window.scrollBy(0, y), scrollDirection);

            // Wait standard duration between actions
            const delay = Math.floor(Math.random() * 8000) + 4000; // 4-12 seconds
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(resolve, delay);
              browser.once('disconnected', () => {
                clearTimeout(timeout);
                reject(new Error('Browser closed'));
              });
            });
          } catch (loopError) {
            break; // Exit presence loop on browser disconnect or navigation issue
          }
        }

        console.log('Browser window closed. Relaunching in 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (err) {
      console.error(`Error in main controller: ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

process.on('uncaughtException', (err) => {
  console.error('Critical Uncaught Exception:', err.stack || err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

main();
