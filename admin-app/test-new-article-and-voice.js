const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function testNewArticleAndVoice() {
  console.log("=================================================");
  console.log("🚀 TESTING REAL-TIME NEW ARTICLE & FEMALE AUDIO");
  console.log("=================================================\n");

  const screenshotDir = path.join(__dirname, "test-artifacts");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({
    channel: "msedge",
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  // Track results
  const results = {
    consumerLandsOnCaughtUp: false,
    adminPublishesNewCard: false,
    consumerAutoReceivesNewCard: false,
    femaleVoiceAnchorAvailable: false,
    femaleVoiceSelectedByDefault: false,
  };

  try {
    // -------------------------------------------------------------
    // STEP 1: Consumer reads all cards and lands on All Caught Up
    // -------------------------------------------------------------
    console.log("Step 1: Setting consumer app to All Caught Up state on localhost:3000...");
    const consumerPage = await context.newPage();
    await consumerPage.goto("http://localhost:3000", { waitUntil: "networkidle" });

    // Dismiss Persona Modal if open
    const modalHeading = consumerPage.locator("text=Choose Your Reading Lens");
    if (await modalHeading.isVisible({ timeout: 2000 }).catch(() => false)) {
      await consumerPage.click("button:has-text('Citizen & General Public')");
      await consumerPage.click("button:has-text('Continue Reading')");
      await consumerPage.waitForTimeout(500);
    }

    // Dismiss PushPrompt if open
    const promptDismiss = consumerPage.locator("button[aria-label='Dismiss alert prompt']");
    if (await promptDismiss.isVisible({ timeout: 2000 }).catch(() => false)) {
      await promptDismiss.click({ force: true });
      await consumerPage.waitForTimeout(300);
    }

    // Fetch all current card IDs and mark them as read in localStorage
    const cardIds = await consumerPage.evaluate(() => {
      const els = document.querySelectorAll("[data-card-id]");
      return Array.from(els).map(el => el.getAttribute("data-card-id")).filter(Boolean);
    });
    console.log("Initial card IDs read:", cardIds.length);

    await consumerPage.evaluate((ids) => {
      localStorage.setItem("juris_read_cards", JSON.stringify(ids));
    }, cardIds);

    // Refresh to enter the All Caught Up landing view
    await consumerPage.reload({ waitUntil: "networkidle" });
    await consumerPage.waitForTimeout(800);

    const caughtUpText = await consumerPage.locator("h2").textContent().catch(() => null);
    console.log("Consumer screen header:", caughtUpText);
    if (caughtUpText && caughtUpText.includes("All Caught Up")) {
      results.consumerLandsOnCaughtUp = true;
      console.log("✅ Verified: Consumer is sitting on the 'You're All Caught Up!' screen.");
    }
    await consumerPage.screenshot({ path: path.join(screenshotDir, "21-consumer-waiting-on-caught-up.png") });

    // -------------------------------------------------------------
    // STEP 2: Admin publishes a brand new card in Tab 2
    // -------------------------------------------------------------
    console.log("\nStep 2: Admin opens Tab 2 on localhost:3001/compose to publish a new card...");
    const adminPage = await context.newPage();
    await adminPage.goto("http://localhost:3001/compose", { waitUntil: "networkidle" });

    // Authenticate if gate is shown
    const pwInput = adminPage.locator("input[placeholder*='master password']");
    if (await pwInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pwInput.fill("JurisAdmin@2026");
      await adminPage.click("button[type='submit']");
      await adminPage.waitForSelector("text=Manual Card Composer", { timeout: 8000 });
    }

    const newHeadline = `Breaking SC Precedent: Rapid Electoral Disclosure ${Date.now().toString().slice(-4)}`;
    console.log("Publishing new card with headline:", newHeadline);

    await adminPage.locator("input[placeholder*='Headline of the ruling']").fill(newHeadline);
    await adminPage.locator("textarea[placeholder*='Paste raw judgment']").fill("The Supreme Court held that transparency in political contributions is protected under Article 19(1)(a).");
    
    // Fill advocate and citizen summaries
    const textareas = await adminPage.locator("form textarea").all();
    if (textareas.length >= 2) {
      await textareas[0].fill("A 5-judge Constitution Bench directed immediate disclosure of electoral contributions without further delay.");
      await textareas[1].fill("The Supreme Court ordered full transparency in political funding records to protect citizen voting rights.");
    }

    // Submit publishing
    await adminPage.click("button:has-text('Publish to Live Feed')");
    await adminPage.waitForSelector("text=Card published successfully", { timeout: 8000 });
    results.adminPublishesNewCard = true;
    console.log("✅ Verified: New card successfully published in Admin!");
    await adminPage.screenshot({ path: path.join(screenshotDir, "22-admin-new-card-published.png") });

    // -------------------------------------------------------------
    // STEP 3: Verify Consumer Tab receives the new article!
    // -------------------------------------------------------------
    console.log("\nStep 3: Switching to Consumer Tab to verify automatic new article detection...");
    await consumerPage.bringToFront();

    // Consumer was on All Caught Up screen. With real-time BroadcastChannel & auto-polling,
    // it will automatically detect the new card without manual refresh!
    console.log("Waiting for consumer page to automatically transition to new article...");
    await consumerPage.waitForFunction((expectedHeadline) => {
      const h1s = Array.from(document.querySelectorAll("h1"));
      return h1s.some(el => el.textContent && el.textContent.includes(expectedHeadline));
    }, newHeadline, { timeout: 15000 });

    const receivedTitle = await consumerPage.locator(`h1:has-text("${newHeadline}")`).first().textContent();
    console.log("Received card title in Consumer Tab:", receivedTitle);

    if (receivedTitle && receivedTitle.includes(newHeadline)) {
      results.consumerAutoReceivesNewCard = true;
      console.log("🎉 SUCCESS! New article automatically appeared on consumer screen from All Caught Up state!");
    }
    await consumerPage.screenshot({ path: path.join(screenshotDir, "23-consumer-new-article-appeared.png") });

    // -------------------------------------------------------------
    // STEP 4: Test Female Voice Anchor in AudioByteModal
    // -------------------------------------------------------------
    console.log("\nStep 4: Testing Audio Player and Female Voice Anchor...");
    const audioBtn = consumerPage.locator("button:has-text('Listen Audio')").first();
    await audioBtn.click();
    await consumerPage.waitForSelector("text=Legal Audio Docket", { timeout: 5000 });

    // Check voice selector
    const voiceSelect = consumerPage.locator("select");
    await voiceSelect.waitFor({ state: "visible", timeout: 4000 });

    const selectedOptionText = await voiceSelect.evaluate(el => el.options[el.selectedIndex]?.text);
    console.log("Currently selected voice anchor in UI:", selectedOptionText);

    const allOptions = await voiceSelect.evaluate(el => Array.from(el.options).map(o => o.text));
    console.log("Available voice options:", allOptions);

    const hasFemaleOption = allOptions.some(opt => 
      opt.includes("Heera") || opt.includes("Zira") || opt.includes("Aria") || 
      opt.includes("Jenny") || opt.includes("Samantha") || opt.includes("Female")
    );

    if (hasFemaleOption) {
      results.femaleVoiceAnchorAvailable = true;
      console.log("✅ Verified: Expressive female voice anchor options detected!");
    }

    if (selectedOptionText && (selectedOptionText.includes("Heera") || selectedOptionText.includes("Zira") || selectedOptionText.includes("Female"))) {
      results.femaleVoiceSelectedByDefault = true;
      console.log("✅ Verified: Expressive female voice anchor selected by default!");
    }

    // Switch to another voice option if available to verify interactivity
    if (allOptions.length > 1) {
      console.log("Testing voice switching...");
      await voiceSelect.selectOption({ index: 1 });
      await consumerPage.waitForTimeout(500);
      const newSelected = await voiceSelect.evaluate(el => el.options[el.selectedIndex]?.text);
      console.log(" - Switched to voice anchor:", newSelected);
    }

    await consumerPage.screenshot({ path: path.join(screenshotDir, "24-female-voice-anchor-player.png") });

    // Close audio modal
    await consumerPage.click("button[aria-label='Close audio player']");
    await consumerPage.waitForTimeout(400);

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await browser.close();
  }

  console.log("\n=================================================");
  console.log("📊 NEW ARTICLE & FEMALE AUDIO TEST RESULTS");
  console.log("=================================================");
  console.table(results);

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  console.log(`Score: ${passed}/${total} checks passed (${Math.round((passed/total)*100)}%)\n`);
}

testNewArticleAndVoice().catch(console.error);
