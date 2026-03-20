/**
 * Analyzes a page and returns structured data
 * @param {import('puppeteer').Page} page
 * @returns {Promise<object>}
 */
async function analyzePage(page) {
    const performance = await getPerformanceMetrics(page);
    const content = await getContentAnalysis(page);
    return { ...content, performance };
  }
  
  /**
   * Extracts performance timing from a page
   */
  async function getPerformanceMetrics(page) {
    return await page.evaluate(() => {
      const nav = window.performance.getEntriesByType('navigation')[0];
      if (!nav) return {};
      return {
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
        domComplete: Math.round(nav.domComplete - nav.startTime),
        loadEvent: Math.round(nav.loadEventEnd - nav.startTime),
      };
    });
  }
  
  /**
   * Extracts content analysis from a page
   */
  async function getContentAnalysis(page) {
    return await page.evaluate(() => {
      // Headings
      const headings = {};
      for (let i = 1; i <= 6; i++) {
        const els = [...document.querySelectorAll(`h${i}`)];
        if (els.length > 0) {
          headings[`h${i}`] = {
            count: els.length,
            first: els[0]?.textContent.trim().substring(0, 60),
          };
        }
      }
  
      // Links
      const allLinks = [...document.querySelectorAll('a')];
      const externalLinks = allLinks.filter(
        (a) => a.href && !a.href.includes(window.location.hostname)
      );
  
      // Images
      const allImages = [...document.querySelectorAll('img')];
      const imagesNoAlt = allImages.filter((img) => !img.getAttribute('alt'));
  
      return {
        title: document.title,
        url: window.location.href,
        meta: {
          description:
            document.querySelector('meta[name="description"]')?.content || 'N/A',
          viewport:
            document.querySelector('meta[name="viewport"]')?.content || 'N/A',
          lang: document.documentElement.lang || 'N/A',
        },
        headings,
        links: {
          total: allLinks.length,
          external: externalLinks.length,
          internal: allLinks.length - externalLinks.length,
        },
        images: {
          total: allImages.length,
          withoutAlt: imagesNoAlt.length,
        },
        resources: {
          stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
          inlineStyles: document.querySelectorAll('style').length,
          scripts: document.querySelectorAll('script').length,
        },
        wordCount: document.body?.innerText.trim().split(/\s+/).length || 0,
        domElements: document.querySelectorAll('*').length,
      };
    });
  }
  
  /**
   * Prints the side-by-side comparison report
   */
  function printReport(urlLeft, left, urlRight, right) {
    const COL = 30;
    const divider = '─'.repeat(75);
  
    const row = (label, valL, valR) => {
      console.log(
        `  ${label.padEnd(22)} │ ${String(valL).padEnd(COL)} │ ${String(valR).padEnd(COL)}`
      );
    };
  
    console.log(`\n${'═'.repeat(75)}`);
    console.log('   SIDE-BY-SIDE SITE COMPARISON');
    console.log(`${'═'.repeat(75)}`);
  
    console.log(
      `  ${'Metric'.padEnd(22)} │ ${'⬅ LEFT WINDOW'.padEnd(COL)} │ ${'➡ RIGHT WINDOW'.padEnd(COL)}`
    );
    console.log(`  ${'─'.repeat(22)}─┼─${'─'.repeat(COL)}─┼─${'─'.repeat(COL)}`);
  
    row('URL', urlLeft, urlRight);
    row('Title', left.title.substring(0, COL), right.title.substring(0, COL));
    row('Language', left.meta.lang, right.meta.lang);
    console.log(`  ${divider}`);
  
    row('Word Count', left.wordCount, right.wordCount);
    row('DOM Elements', left.domElements, right.domElements);
    row('Total Links', left.links.total, right.links.total);
    row('External Links', left.links.external, right.links.external);
    row('Images', left.images.total, right.images.total);
    row('Images (no alt)', left.images.withoutAlt, right.images.withoutAlt);
    console.log(`  ${divider}`);
  
    row('Stylesheets', left.resources.stylesheets, right.resources.stylesheets);
    row('Inline Styles', left.resources.inlineStyles, right.resources.inlineStyles);
    row('Scripts', left.resources.scripts, right.resources.scripts);
    console.log(`  ${divider}`);
  
    row('DOM Loaded', `${left.performance.domContentLoaded || '?'}ms`, `${right.performance.domContentLoaded || '?'}ms`);
    row('DOM Complete', `${left.performance.domComplete || '?'}ms`, `${right.performance.domComplete || '?'}ms`);
    row('Load Event', `${left.performance.loadEvent || '?'}ms`, `${right.performance.loadEvent || '?'}ms`);
  
    console.log(`${'═'.repeat(75)}\n`);
  }
  
export {
    analyzePage,
    getPerformanceMetrics,
    getContentAnalysis,
    printReport,
  };
  