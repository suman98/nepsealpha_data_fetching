import puppeteer from 'puppeteer';
import config from '../utils/config.js';
import { analyzePage } from '../utils/utils.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Polyfill for __dirname in ES modules
// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetSite = config.SITE_RIGHT;
/**
 * Launches the RIGHT browser window, navigates, and analyzes
 * @returns {Promise<{ browser, page, analysis }>}
 */
export default async function launchTab2() {
  const SCREEN_MARGIN = 24;
  const WINDOW_GAP = 8;
  const availableWidth = config.SCREEN_WIDTH - SCREEN_MARGIN * 2 - WINDOW_GAP;
  const halfWidth = Math.floor(availableWidth / 2);
  const rightWindowX = SCREEN_MARGIN + halfWidth + WINDOW_GAP;

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--window-size=${halfWidth},${config.SCREEN_HEIGHT}`,
      `--window-position=${rightWindowX},0`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
    defaultViewport: {
      width: halfWidth - 20,
      height: config.SCREEN_HEIGHT - 100,
    },
  });

  // Use the default blank tab (avoids extra empty tab)
  const page = (await browser.pages())[0];

  await page.goto(targetSite, {
    // @ts-ignore
    waitUntil: config.WAIT_UNTIL,
    timeout: config.NAVIGATION_TIMEOUT,
  });
 
  // Inject @nepse/injection.js into the page

  const injectionPath = path.resolve(__dirname, 'injection.js');
  await page.addScriptTag({ path: injectionPath });
  console.log('  ➡ Injected @nepse/injection.js');

  // Analyze
  console.log('  ➡ Analyzing page...');
  const analysis = await analyzePage(page);
  console.log('  ➡ Analysis complete!');

  // Screenshot
  await page.screenshot({ path: 'screenshot_right.png', fullPage: false });
  console.log('  ➡ Screenshot saved: screenshot_right.png');

  return { browser, page, analysis };
}
