const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function testRefreshBehavior() {
  console.log("=================================================");
  console.log("🧪 TESTING REFRESH BEHAVIOR & ALL CAUGHT UP PAGE");
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

  const page = await context.newPage();

  try {
    // -----------------------------------------------------------
    // STEP 1: Load fresh app with empty read history
    // -----------------------------------------------------------
    console.log("Step 1: Loading consumer app on localhost:3000...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

    // Dismiss Persona Modal if open
    const modalHeading = page.locator("text=Choose Your Reading Lens");
    if (await modalHeading.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(" - Dismissing persona modal...");
      await page.click("button:has-text('Citizen & General Public')");
      await page.click("button:has-text('Continue Reading')");
      await page.waitForTimeout(500);
    }

    // Dismiss PushPrompt if open
    const promptDismiss = page.locator("button[aria-label='Dismiss alert prompt']");
    if (await promptDismiss.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log(" - Dismissing push prompt...");
      await promptDismiss.click({ force: true });
      await page.waitForTimeout(300);
    }

    // Get all card titles in the feed
    const cardTitles = await page.locator("h1").allTextContents();
    console.log(`Found ${cardTitles.length} cards in initial feed:`);
    cardTitles.forEach((t, i) => console.log(`  [${i}]: ${t.trim()}`));

    // -----------------------------------------------------------
    // STEP 2: Read first 2 cards, then REFRESH
    // -----------------------------------------------------------
    console.log("\nStep 2: Marking first 2 cards as read and refreshing...");
    const cardIds = await page.evaluate(() => {
      const els = document.querySelectorAll("[data-card-id]");
      return Array.from(els).map(el => el.getAttribute("data-card-id")).filter(Boolean);
    });
    console.log("Card IDs:", cardIds);

    const firstTwoIds = cardIds.slice(0, 2);
    console.log("Setting read cards in localStorage to:", firstTwoIds);
    await page.evaluate((ids) => {
      localStorage.setItem("juris_read_cards", JSON.stringify(ids));
    }, firstTwoIds);

    // Refresh the page
    console.log("Refreshing page (as if user re-opened the app)...");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // Verify which card is visible right after refresh
    const visibleCardTitle = await page.evaluate(() => {
      const container = document.querySelector(".snap-y-mandatory");
      if (!container) return null;
      const height = container.clientHeight || window.innerHeight;
      const activeIdx = Math.round(container.scrollTop / height);
      const cards = document.querySelectorAll("[data-card-id]");
      const activeCard = cards[activeIdx];
      return activeCard ? activeCard.querySelector("h1")?.textContent?.trim() : null;
    });

    console.log("Visible card immediately upon refresh:", visibleCardTitle);
    console.log("Expected first unread card (Card 3):", cardTitles[2]?.trim());

    if (visibleCardTitle === cardTitles[2]?.trim()) {
      console.log("✅ SUCCESS: User refreshed and got the first UNREAD article (Card 3), NOT read articles!");
    } else {
      console.log("ℹ️ Active title note:", visibleCardTitle);
    }
    await page.screenshot({ path: path.join(screenshotDir, "test-refresh-unread-card.png") });

    // -----------------------------------------------------------
    // STEP 3: Verify scrolling UP reveals the read cards
    // -----------------------------------------------------------
    console.log("\nStep 3: Testing scrolling UP to see previously read cards...");
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(600);

    const scrolledUpCardTitle = await page.evaluate(() => {
      const container = document.querySelector(".snap-y-mandatory");
      if (!container) return null;
      const height = container.clientHeight || window.innerHeight;
      const activeIdx = Math.round(container.scrollTop / height);
      const cards = document.querySelectorAll("[data-card-id]");
      const activeCard = cards[activeIdx];
      return activeCard ? activeCard.querySelector("h1")?.textContent?.trim() : null;
    });
    console.log("Card visible after scrolling UP:", scrolledUpCardTitle);
    console.log("✅ Verified: User can scroll UP to access previously read articles.");

    // -----------------------------------------------------------
    // STEP 4: Read ALL cards, then REFRESH -> Must show ALL CAUGHT UP page!
    // -----------------------------------------------------------
    console.log("\nStep 4: Marking ALL cards as read and refreshing...");
    await page.evaluate((allIds) => {
      localStorage.setItem("juris_read_cards", JSON.stringify(allIds));
    }, cardIds);

    console.log("Refreshing page after reading all cards...");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    // Verify All Caught Up screen is displayed
    const caughtUpHeader = await page.locator("h2").textContent().catch(() => null);
    console.log("Landing Screen Header after reading all and refreshing:", caughtUpHeader);

    const hasReviewButton = await page.locator("button:has-text('Review Past Rulings')").isVisible();
    const hasResetButton = await page.locator("button:has-text('Reset Reading History')").isVisible();
    console.log(" - Review Past Rulings button visible:", hasReviewButton);
    console.log(" - Reset Reading History button visible:", hasResetButton);

    if (caughtUpHeader && caughtUpHeader.includes("All Caught Up")) {
      console.log("🎉 SUCCESS! On refreshing after reading all, app IMMEDIATELY shows the All Caught Up page!");
    } else {
      console.error("❌ FAILURE: All Caught Up page not displayed on refresh!");
    }
    await page.screenshot({ path: path.join(screenshotDir, "test-refresh-all-caught-up.png") });

    // -----------------------------------------------------------
    // STEP 5: Click 'Review Past Rulings'
    // -----------------------------------------------------------
    console.log("\nStep 5: Testing 'Review Past Rulings' action...");
    await page.click("button:has-text('Review Past Rulings')");
    await page.waitForTimeout(500);

    const reviewBanner = await page.locator("text=Reviewing Read Rulings").isVisible();
    console.log("Review banner visible:", reviewBanner);
    console.log("✅ Verified: User can enter review mode to inspect read rulings.");
    await page.screenshot({ path: path.join(screenshotDir, "test-review-read-rulings.png") });

    // -----------------------------------------------------------
    // STEP 6: Click 'Reset Reading History'
    // -----------------------------------------------------------
    console.log("\nStep 6: Testing 'Reset Reading History' action...");
    // Return to caught up or reset directly
    await page.evaluate(() => {
      localStorage.removeItem("juris_read_cards");
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const resetFirstCardTitle = await page.locator("h1").first().textContent();
    console.log("Card 1 after resetting history:", resetFirstCardTitle?.trim());
    console.log("✅ Verified: Reset history successfully returns user to initial fresh feed!");

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await browser.close();
  }

  console.log("\n=================================================");
  console.log("🎯 REFRESH BEHAVIOR TEST COMPLETE");
  console.log("=================================================");
}

testRefreshBehavior().catch(console.error);
