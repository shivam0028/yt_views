# Microsoft Edge Single-Page Multi-Screen Dashboard

A lightweight, resource-optimized Node.js script that opens a single Microsoft Edge browser window and loads an HTML grid containing 50 active embedded video players. 

To bypass standard browser frame restrictions (CORS) that occur on empty origins like `about:blank`, the script runs a lightweight, built-in HTTP server locally at `http://127.0.0.1:3030/` to host the dashboard layout.

## Features

- **Single-Window & Single-Page Execution**: Opens exactly one browser window and one tab. This prevents system freezes and keeps CPU and RAM usage extremely low compared to launching 50 separate browser processes or tabs.
- **50-Screen CSS Grid**: Dynamically generates a 10-column layout of embedded iframes, configured with autoplay, loop, and mute commands.
- **Microsoft Edge Support**: Automatically scans standard installation directories on Windows to find and use `msedge.exe`, falling back to standard Chromium if not present.
- **Presence Simulation**: Simulates human engagement by executing randomized mouse movement sweeps and vertical page scrolling over the grid dashboard.
- **Relaunch Resilience**: Automatically detects if you close the Microsoft Edge window, waiting 3 seconds before spawning a new browser instance and reloading the grid layout.
- **Muted Audio**: Launches the browser with mute commands globally and programmatically silences HTML5 elements inside the page.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- Microsoft Edge browser installed (standard on Windows OS)

## Setup & Installation

1. Open PowerShell/cmd in the project root directory.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```

## Configuration

Modify options inside [config.js](file:///d:/hp/VS%20Code/VoicePack/config.js):

- `urls`: List containing your target YouTube video or Shorts link.
- `proxies`: Proxy endpoints. (Applied globally to the browser window process).
- `puppeteer.headless`: Run hidden (`true`) or visible (`false` - recommended to view the 50-screen layout).

## Execution

To start the dashboard controller:

```bash
npm start
```

Press `Ctrl + C` in the console window to terminate the background server and script execution.
