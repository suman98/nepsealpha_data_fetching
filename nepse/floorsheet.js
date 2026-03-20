import puppeteer from 'puppeteer';
import config from '../utils/config.js';
import { analyzePage } from '../utils/utils.js';

/**
 * Launches the LEFT browser window, navigates, and analyzes
 * @returns {Promise<{ browser, page, analysis }>}
 */
export default async function launchTab1() {
  console.log('⬅  Launching LEFT window...');

  const halfWidth = Math.floor(config.SCREEN_WIDTH / 2);

  // Launch browser positioned on the LEFT half
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--window-size=${halfWidth},${config.SCREEN_HEIGHT}`,
      `--window-position=0,0`,
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

  // Navigate
  console.log(`⬅  Navigating to: ${config.SITE_FLOORSHEET}`);
  await page.goto(config.SITE_FLOORSHEET, {
    // @ts-ignore
    waitUntil: config.WAIT_UNTIL,
    timeout: config.NAVIGATION_TIMEOUT,
  });
  console.log('⬅  Page loaded!');

  // Analyze
  console.log('⬅  Analyzing page...');
  const analysis = await analyzePage(page);
  console.log('⬅  Analysis complete!');

  // Screenshot
  await page.screenshot({ path: 'screenshot_left.png', fullPage: false });
  console.log('⬅  Screenshot saved: screenshot_left.png');

  return { browser, page, analysis };
}

