/**
 * Configuration options for the Puppeteer Automation system.
 */
module.exports = {
  // Array of target URLs to visit and interact with.
  urls: [
    "https://youtube.com/shorts/HZDnS7l0-dk?si=bqhLbRQ-XrRWpOQz",
  ],

  // Array of proxies to rotate through.
  // Supported formats:
  // - "http://ip:port"
  // - "http://user:password@ip:port"
  // Leave empty if running without proxies.
  proxies: [
    // "http://username:password@proxy_ip:proxy_port",
    // "http://proxy_ip2:proxy_port2"
  ],

  // Maximum number of concurrent browser instances.
  concurrencyLimit: 2,

  // Watch/Stay duration bounds on the target URL (in seconds).
  watchDurationMin: 180,
  watchDurationMax: 480,

  // Puppeteer Launch configuration options.
  puppeteer: {
    headless: false, // Run in headless mode. Set to false for visual debugging.
    executablePath: null, // Specify custom Chrome path if needed, e.g., 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  }
};
