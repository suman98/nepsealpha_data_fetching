import config from './utils/config.js';
import floorsheetTab from './nepse/floorsheet.js';
import tmsTab from './tms/tms.js';
import { printReport } from './utils/utils.js';

let browserLeft = null;
let browserRight = null;

(async () => {
  console.log('🚀 Starting Side-by-Side Analyzer...\n');

  try {
    // =============================================
    // Launch both windows in parallel
    // =============================================
    const [resultLeft, resultRight] = await Promise.all([
      floorsheetTab(),
      tmsTab(),
    ]);

    browserLeft = resultLeft.browser;
    browserRight = resultRight.browser;

    // =============================================
    // Print comparison report
    // =============================================
    printReport(
      config.SITE_LEFT,
      resultLeft.analysis,
      config.SITE_RIGHT,
      resultRight.analysis
    );

    console.log('👀 Both browsers are open for manual inspection.');
    console.log('   Press Ctrl+C to close everything.\n');

    // Keep alive — wait for user to kill the process
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Cleanup on exit
    if (browserLeft) await browserLeft.close();
    if (browserRight) await browserRight.close();
  }
})();

// Graceful shutdown on Ctrl+C
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  try {
    if (browserLeft) await browserLeft.close();
    if (browserRight) await browserRight.close();
  } catch (e) {
    // Ignore errors during forced shutdown
  }
  process.exit(0);
});
