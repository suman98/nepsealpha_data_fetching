import config from './utils/config.js';
import { launchTab1 } from './nepse/tab1.js';
import { launchTab2 } from './tms/tab2.js';
import { printReport } from './utils/utils.js';

(async () => {
  console.log('🚀 Starting Side-by-Side Analyzer...\n');

  let browserLeft = null;
  let browserRight = null;

  try {
    // =============================================
    // Launch both windows in parallel
    // =============================================
    const [resultLeft, resultRight] = await Promise.all([
      launchTab1(),
      launchTab2(),
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
  process.exit(0);
});
