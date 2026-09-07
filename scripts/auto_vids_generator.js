// Autonomous Google Vids & Veo 3.1 Generator via Chrome DevTools Protocol (CDP)
// Connects to your authenticated Google Vids tab, submits prompts, generates video, inserts, and exports.

const { chromium } = require('C:/Users/Arshid.Wani/chatrchat/node_modules/playwright');

async function generateAndDownloadVidsClip(options) {
  const { prompt, aspectRatio = 'Portrait', maxWaitMs = 300000 } = options;
  console.log(`[GoogleVids] Connecting to Chrome on port 9222...`);

  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('docs.google.com/videos'));
  if (!page) {
    await browser.close();
    throw new Error('No active Google Vids tab found on http://localhost:9222');
  }

  console.log(`[GoogleVids] Attached to page: "${await page.title()}"`);

  // Ensure prompt side sheet is open
  const aiVideoTab = await page.$('button[aria-label="Create"], [aria-label="AI Video"]');
  if (aiVideoTab) {
    await aiVideoTab.click();
    await page.waitForTimeout(1000);
  }

  // Set prompt text
  console.log(`[GoogleVids] Entering prompt: "${prompt.slice(0, 60)}..."`);
  const textbox = await page.$('[aria-label*="Describe your video"]');
  if (!textbox) {
    await browser.close();
    throw new Error('Prompt textbox not found in Google Vids UI');
  }

  await textbox.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(prompt, { delay: 10 });
  await page.waitForTimeout(1000);

  // Click Generate
  const genBtn = await page.$('button[aria-label="Generate"]');
  if (!genBtn) {
    await browser.close();
    throw new Error('Generate button not found');
  }
  await genBtn.click();
  console.log(`[GoogleVids] Generation requested. Waiting for Google Veo render...`);

  // Monitor generation
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    await page.waitForTimeout(5000);
    const status = await page.evaluate(() => {
      const text = document.body.innerText;
      const match = text.match(/(\d+)%/);
      const isGenerating = text.includes('Your video clip is generating') || text.includes('Generating');
      return { percent: match ? match[1] + '%' : null, isGenerating };
    });

    if (status.percent) {
      console.log(`[GoogleVids] Progress: ${status.percent}`);
    }

    if (!status.isGenerating && !status.percent) {
      console.log(`[GoogleVids] Generation completed!`);
      break;
    }
  }

  // Click Insert
  console.log(`[GoogleVids] Inserting clip into timeline...`);
  await page.waitForTimeout(2000);
  await page.click('button.appsDocsAiGenerativeaiVideoUiSidebarWizThumbnailactionbarInsertVideoButton');
  await page.waitForTimeout(3000);

  // Trigger File -> Download -> MP4 video (.mp4)
  console.log(`[GoogleVids] Triggering MP4 export...`);
  const fileMenu = await page.$('#docs-file-menu');
  if (fileMenu) await fileMenu.click();
  else await page.getByRole('menuitem', { name: 'File' }).click();
  await page.waitForTimeout(800);

  const downloadItem = await page.getByRole('menuitem', { name: 'Download' });
  if (downloadItem) {
    await downloadItem.hover();
    await page.waitForTimeout(800);
    const mp4Option = await page.getByText('MP4 video (.mp4)');
    if (mp4Option) await mp4Option.click();
  }

  console.log(`[GoogleVids] Export dispatched to Downloads folder.`);
  await browser.close();
  return 'Exported';
}

const defaultPrompt = process.argv[2] || "A confident young tech founder explaining cloud AI architecture in a glass tech hub, 4k photorealistic portrait 9:16.";
generateAndDownloadVidsClip({ prompt: defaultPrompt })
  .then(() => console.log('✅ Google Vids generation cycle complete!'))
  .catch(err => {
    console.error('❌ Error in generation cycle:', err);
    process.exit(1);
  });
