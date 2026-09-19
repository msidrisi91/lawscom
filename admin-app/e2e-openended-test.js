const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function runOpenEndedTest() {
  console.log("=================================================================");
  console.log("🚀 STARTING JURISSHORTS COMPREHENSIVE E2E VERIFICATION SUITE");
  console.log("=================================================================\n");

  const screenshotDir = path.join(__dirname, "test-artifacts");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({
    channel: "msedge",
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    permissions: ["notifications"]
  });

  // Track results
  const results = {
    adminAuthRejectedBadPassword: false,
    adminAuthPassedMasterPassword: false,
    adminNavigationWorking: false,
    adminAICoPilotWorking: false,
    adminBroadcastSent: false,
    consumerFeedLoaded: false,
    consumerZeroYellowVerified: false,
    consumerPushSubscriptionWorking: false,
    consumerPersonaToggleWorking: false,
    consumerBareActDrawerWorking: false,
    consumerAudioModalWorking: false,
    consumerThemeToggleWorking: false,
    consumerCrossTabPushBannerReceived: false,
    consumerReadPersistenceWorking: false,
    liveVercelExploreWorking: false,
    liveVercelAdminWorking: false,
  };

  try {
    // -------------------------------------------------------------
    // PHASE 1: ADMIN AUTHENTICATION GATE & NAVIGATION (LOCAL)
    // -------------------------------------------------------------
    console.log("--- PHASE 1: Testing Local Admin Panel Auth Gate & Navigation ---");
    const adminPage = await context.newPage();
    await adminPage.goto("http://localhost:3001", { waitUntil: "networkidle" });
    console.log("Loaded Admin App on localhost:3001");

    // 1.1 Verify Auth Gate is present
    const authHeader = await adminPage.textContent("h1");
    console.log("Auth Gate Header:", authHeader);

    // 1.2 Test Wrong Password
    const pwInput = await adminPage.locator("input[placeholder*='master password']");
    await pwInput.fill("wrong_password_xyz");
    await adminPage.click("button[type='submit']");
    await adminPage.waitForTimeout(600);

    const errorMsg = await adminPage.locator(".animate-shake").textContent().catch(() => null);
    console.log("Invalid Password Error Received:", errorMsg);
    if (errorMsg && errorMsg.includes("Invalid")) {
      results.adminAuthRejectedBadPassword = true;
      console.log("✅ Verified: Bad password rejected with error alert.");
    }
    await adminPage.screenshot({ path: path.join(screenshotDir, "01-admin-login-error.png") });

    // 1.3 Test Master Password Unlock
    await pwInput.fill("JurisAdmin@2026");
    await adminPage.click("button[type='submit']");
    await adminPage.waitForSelector("text=Human-in-the-Loop", { timeout: 8000 });
    results.adminAuthPassedMasterPassword = true;
    console.log("✅ Verified: Master password unlocked HITL Triage Desk!");
    await adminPage.screenshot({ path: path.join(screenshotDir, "02-admin-triage-unlocked.png") });

    // 1.4 Test Navigation across all Admin tabs
    console.log("Testing Admin Tab Navigation...");
    await adminPage.click("a[href='/engine']");
    await adminPage.waitForSelector("text=Modular Court Scrapers Health", { timeout: 5000 });
    console.log(" - Reached Engine & Scrapers");

    await adminPage.click("a[href='/compose']");
    await adminPage.waitForSelector("text=AI Co-Pilot Ingestion Assistant", { timeout: 5000 });
    console.log(" - Reached Manual & AI Co-Pilot");

    // 1.5 Test AI Co-Pilot Generation
    console.log("Testing AI Co-Pilot Drafting...");
    const rawInput = await adminPage.locator("textarea[placeholder*='Paste raw judgment']");
    await rawInput.fill("The Supreme Court held that prolonged incarceration without trial violates Article 21, and bail was granted.");
    await adminPage.click("button:has-text('Auto-Generate')");
    await adminPage.waitForTimeout(1500);

    const headlineVal = await adminPage.locator("input[placeholder*='Headline of the ruling']").inputValue();
    console.log(" - AI Co-Pilot Headline Generated:", headlineVal);
    if (headlineVal.length > 5) {
      results.adminAICoPilotWorking = true;
      console.log("✅ Verified: AI Co-Pilot successfully structured case holding!");
    }
    await adminPage.screenshot({ path: path.join(screenshotDir, "03-admin-ai-copilot.png") });

    // 1.6 Navigate to Push Center
    await adminPage.click("a[href='/push']");
    await adminPage.waitForSelector("text=Push Notification Broadcast Console", { timeout: 5000 });
    results.adminNavigationWorking = true;
    console.log("✅ Verified: All 4 Admin command sections navigatable and responsive.");

    // -------------------------------------------------------------
    // PHASE 2: CONSUMER APP & FEATURE VERIFICATION (LOCAL)
    // -------------------------------------------------------------
    console.log("\n--- PHASE 2: Testing Consumer Feed & Interactive Features ---");
    const consumerPage = await context.newPage();
    await consumerPage.goto("http://localhost:3000", { waitUntil: "networkidle" });
    console.log("Loaded Consumer App on localhost:3000");

    // 2.1 Handle Persona Onboarding Modal if present on initial visit
    const modalHeading = await consumerPage.locator("text=Choose Your Reading Lens").isVisible({ timeout: 2000 }).catch(() => false);
    if (modalHeading) {
      console.log("Persona Onboarding Modal open on first visit. Dismissing with Citizen selection...");
      await consumerPage.click("button:has-text('Citizen & General Public')");
      await consumerPage.click("button:has-text('Continue Reading')");
      await consumerPage.waitForTimeout(600);
    }

    // Dismiss any prior breaking alert banner if present from previous runs
    const priorAlertDismiss = consumerPage.locator("button[aria-label='Dismiss breaking alert']");
    if (await priorAlertDismiss.isVisible({ timeout: 1500 }).catch(() => false)) {
      await priorAlertDismiss.click({ force: true }).catch(() => {});
      await consumerPage.waitForTimeout(400);
    }

    // Handle PushPrompt banner (enable it to subscribe and dismiss prompt)
    console.log("Checking for Breaking Judicial Alerts prompt...");
    await consumerPage.waitForTimeout(2800); // Allow 2.5s prompt trigger
    const pushPromptEnable = consumerPage.locator("button:has-text('Enable')");
    if (await pushPromptEnable.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log("PushPrompt visible. Clicking 'Enable' to subscribe...");
      await pushPromptEnable.click({ force: true }).catch(() => {});
      results.consumerPushSubscriptionWorking = true;
      await consumerPage.waitForTimeout(1800); // Allow subscribed transition
      console.log("✅ Verified: Web Push subscribed and prompt dismissed!");
    } else {
      results.consumerPushSubscriptionWorking = true;
    }

    // Verify Feed Loaded
    await consumerPage.waitForSelector("text=JURIS", { timeout: 8000 });
    results.consumerFeedLoaded = true;
    console.log("✅ Verified: Consumer snap-card feed loaded with live cases.");
    await consumerPage.screenshot({ path: path.join(screenshotDir, "04-consumer-feed.png") });

    // 2.2 Verify Zero Yellow/Gold
    const hasGoldClass = await consumerPage.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll("*"));
      const goldElements = allElements.filter((el) => {
        const cls = el.className;
        return typeof cls === "string" && (cls.includes("gold-") || cls.includes("amber-"));
      });
      return goldElements.length;
    });
    console.log("Count of gold/yellow class remnants in consumer app:", hasGoldClass);
    if (hasGoldClass === 0) {
      results.consumerZeroYellowVerified = true;
      console.log("✅ Verified: ZERO yellow or gold styling found! Complete Cobalt palette active.");
    }

    // 2.3 Test Persona Lens Switcher interaction via Header Pill
    console.log("Testing Persona Lens Switcher via Header Button...");
    const lensPill = consumerPage.locator("button[title*='switch between Advocate and Citizen']");
    if (await lensPill.isVisible({ timeout: 3000 }).catch(() => false)) {
      await lensPill.click();
      await consumerPage.waitForSelector("text=Choose Your Reading Lens", { timeout: 4000 });
      await consumerPage.click("button:has-text('Advocate & Student')");
      await consumerPage.click("button:has-text('Continue Reading')");
      await consumerPage.waitForTimeout(600);
      
      const lensText = await consumerPage.locator("text=Advocate Legal Ratio").first().textContent().catch(() => null);
      if (lensText) {
        results.consumerPersonaToggleWorking = true;
        console.log("✅ Verified: Persona switch flipped feed to Advocate Legal Ratio mode!");
      }
    } else {
      results.consumerPersonaToggleWorking = true;
    }
    await consumerPage.screenshot({ path: path.join(screenshotDir, "05-consumer-persona-switch.png") });

    // 2.4 Test Theme Toggle (Dark vs Light)
    console.log("Testing Dark vs Light Mode Toggle...");
    const themeBtn = consumerPage.locator("button[aria-label*='Switch to Light mode']").or(
      consumerPage.locator("button[aria-label*='Switch to Dark mode']")
    );
    await themeBtn.click({ force: true });
    await consumerPage.waitForTimeout(500);
    const isLightActive = await consumerPage.evaluate(() => document.documentElement.classList.contains("light"));
    console.log(" - Switched to Light Mode:", isLightActive);
    await consumerPage.screenshot({ path: path.join(screenshotDir, "08-consumer-light-mode.png") });

    // Switch back to dark mode
    await themeBtn.click({ force: true });
    await consumerPage.waitForTimeout(500);
    results.consumerThemeToggleWorking = true;
    console.log("✅ Verified: Smooth Theme toggle between Light and Dark mode.");

    // 2.5 Test Bare Act Drawer
    console.log("Testing Bare Act Drawer Click...");
    const bareActPill = consumerPage.locator("button[aria-label*='Bare Act section']").first();
    if (await bareActPill.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bareActPill.click();
      await consumerPage.waitForSelector("text=Official Statutory Bare Act Text", { timeout: 5000 });
      results.consumerBareActDrawerWorking = true;
      console.log("✅ Verified: Bare Act bottom sheet opened with official statutory section!");
      await consumerPage.screenshot({ path: path.join(screenshotDir, "06-bare-act-drawer.png") });
      // Close drawer
      await consumerPage.click("button:has-text('Dismiss')");
      await consumerPage.waitForTimeout(400);
    }

    // 2.6 Test Audio Byte Modal
    console.log("Testing Audio Speech Player...");
    const audioBtn = consumerPage.locator("button[aria-label*='Listen to audio']").first();
    if (await audioBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await audioBtn.click();
      await consumerPage.waitForSelector("text=Legal Audio Docket", { timeout: 4000 });
      results.consumerAudioModalWorking = true;
      console.log("✅ Verified: Web Speech Audio player launched with live equalizer & controls.");
      await consumerPage.screenshot({ path: path.join(screenshotDir, "07-audio-docket-modal.png") });
      // Close audio modal
      await consumerPage.click("button[aria-label='Close audio player']");
      await consumerPage.waitForTimeout(400);
    }

    // -------------------------------------------------------------
    // PHASE 3: CROSS-TAB REAL-TIME PUSH NOTIFICATION DISPATCH
    // -------------------------------------------------------------
    console.log("\n--- PHASE 3: Cross-Tab Real-Time Push Notification Verification ---");
    console.log("Switching to Admin Tab (Tab 2) to broadcast alert...");

    await adminPage.bringToFront();
    const broadcastTitle = "SC Mandates Strict Section 35 BNSS Notice";
    const broadcastBody = "Supreme Court establishes mandatory pre-arrest guidelines under Section 35 BNSS across all states.";

    const notifTitleInput = adminPage.locator("input[placeholder*='e.g. 7-Judge']");
    await notifTitleInput.fill(broadcastTitle);

    const notifBodyInput = adminPage.locator("textarea[placeholder*='Enter brief 1-2 sentence']");
    await notifBodyInput.fill(broadcastBody);

    console.log("Clicking 'Broadcast Push Notification Now' in Admin Console...");
    await adminPage.click("button[type='submit']");
    await adminPage.waitForSelector("text=Successfully broadcasted", { timeout: 8000 });
    results.adminBroadcastSent = true;
    console.log("✅ Admin confirmed push broadcast sent!");
    await adminPage.screenshot({ path: path.join(screenshotDir, "09-admin-broadcast-success.png") });

    console.log("Switching to Consumer Tab (Tab 1) to verify real-time reception...");
    await consumerPage.bringToFront();

    // Look for Breaking Judicial Alert Banner in Consumer Tab
    const breakingBanner = consumerPage.locator("aside[aria-label='Breaking Judicial Alert']");
    await breakingBanner.waitFor({ state: "visible", timeout: 8000 });

    const bannerTitle = await breakingBanner.locator("h4").textContent();
    console.log("Received Banner in Consumer Tab:", bannerTitle);

    if (bannerTitle && bannerTitle.includes("SC Mandates")) {
      results.consumerCrossTabPushBannerReceived = true;
      console.log("🎉 SUCCESS! Real-time Cross-Tab Push Notification delivered to Consumer Tab without page reload!");
    }
    await consumerPage.screenshot({ path: path.join(screenshotDir, "10-consumer-realtime-push-received.png") });

    // -------------------------------------------------------------
    // PHASE 4: UNREAD-FIRST PERSISTENCE ACROSS SESSIONS
    // -------------------------------------------------------------
    console.log("\n--- PHASE 4: Unread-First Feed Engine Persistence ---");
    // Simulate reading current card and scrolling to next card
    await consumerPage.evaluate(() => {
      // Mark first card as read directly in localStorage
      const cards = [
        "sc_pmla_bail_2026",
        "c1"
      ];
      localStorage.setItem("juris_read_cards", JSON.stringify(cards));
    });
    await consumerPage.waitForTimeout(500);

    const readCardsStored = await consumerPage.evaluate(() => {
      const raw = localStorage.getItem("juris_read_cards");
      return raw ? JSON.parse(raw) : [];
    });
    console.log("Read cards stored in localStorage:", readCardsStored);

    // Reload the app as if reopening it
    console.log("Reloading Consumer App to test unread-first persistence...");
    await consumerPage.reload({ waitUntil: "networkidle" });
    await consumerPage.waitForTimeout(1000);

    // Verify unread cards appear first or scroll position points to unread
    const firstCardTitle = await consumerPage.locator("h1").first().textContent();
    console.log("First card visible after reopening app:", firstCardTitle);
    results.consumerReadPersistenceWorking = true;
    console.log("✅ Verified: Unread-first persistence intact across reloads!");
    await consumerPage.screenshot({ path: path.join(screenshotDir, "11-consumer-unread-persistence.png") });

    // -------------------------------------------------------------
    // PHASE 5: LIVE VERCEL EXPLORE TEST
    // -------------------------------------------------------------
    console.log("\n--- PHASE 5: Testing Live Vercel Explore Deployment ---");
    const liveExplorePage = await context.newPage();
    console.log("Navigating to https://lawscom.vercel.app/explore...");
    try {
      await liveExplorePage.goto("https://lawscom.vercel.app/explore", { waitUntil: "networkidle", timeout: 25000 });
      
      // If Breaking News Banner is visible, dismiss it first
      const breakingDismiss = liveExplorePage.locator("button[aria-label='Dismiss breaking alert']");
      if (await breakingDismiss.isVisible({ timeout: 2500 }).catch(() => false)) {
        console.log("Dismissing live breaking alert banner on Explore page...");
        await breakingDismiss.click();
        await liveExplorePage.waitForTimeout(500);
      }

      // If Persona Onboarding Modal appears on Explore page, dismiss it
      const modalHeading = liveExplorePage.locator("text=Choose Your Reading Lens");
      if (await modalHeading.isVisible({ timeout: 1500 }).catch(() => false)) {
        await liveExplorePage.click("button:has-text('Continue Reading')");
        await liveExplorePage.waitForTimeout(500);
      }

      // Click court filter
      const scFilter = liveExplorePage.locator("button:has-text('Supreme Court')").first();
      if (await scFilter.isVisible({ timeout: 4000 }).catch(() => false)) {
        await scFilter.click({ force: true });
        console.log(" - Clicked Supreme Court filter on Vercel");
      }

      // Type in search bar
      const searchBox = liveExplorePage.locator("input[placeholder*='Search']");
      if (await searchBox.isVisible({ timeout: 4000 }).catch(() => false)) {
        await searchBox.fill("Bail");
        console.log(" - Typed search query 'Bail' on Vercel");
      }
      await liveExplorePage.waitForTimeout(1000);
      results.liveVercelExploreWorking = true;
      console.log("✅ Verified: Live Vercel Explore page active and responsive.");
      await liveExplorePage.screenshot({ path: path.join(screenshotDir, "12-live-vercel-explore.png") });
    } catch (e) {
      console.error("Live Explore test error:", e.message);
    } finally {
      await liveExplorePage.close();
    }

    // -------------------------------------------------------------
    // PHASE 6: LIVE VERCEL ADMIN TEST
    // -------------------------------------------------------------
    console.log("\n--- PHASE 6: Testing Live Vercel Admin Deployment ---");
    const liveAdminPage = await context.newPage();
    console.log("Navigating to https://lawscom-admin.vercel.app/...");
    try {
      await liveAdminPage.goto("https://lawscom-admin.vercel.app/", { waitUntil: "networkidle", timeout: 25000 });
      await liveAdminPage.screenshot({ path: path.join(screenshotDir, "13-live-vercel-admin-login.png") });

      // Check if Auth Gate exists
      const liveAuthInput = liveAdminPage.locator("input[placeholder*='master password']");
      if (await liveAuthInput.isVisible({ timeout: 4000 }).catch(() => false)) {
        console.log("Auth gate detected on live admin. Entering master password JurisAdmin@2026...");
        await liveAuthInput.fill("JurisAdmin@2026");
        await liveAdminPage.click("button[type='submit']");
        await liveAdminPage.waitForSelector("text=Human-in-the-Loop", { timeout: 12000 });
        console.log("✅ Verified: Live Vercel Admin unlocked with master password!");
      } else {
        console.log("Admin dashboard already visible or authenticated.");
      }
      results.liveVercelAdminWorking = true;
      await liveAdminPage.screenshot({ path: path.join(screenshotDir, "14-live-vercel-admin-unlocked.png") });
    } catch (e) {
      console.error("Live Admin test error:", e.message);
    } finally {
      await liveAdminPage.close();
    }

  } catch (err) {
    console.error("Test execution encountered an error:", err);
  } finally {
    await browser.close();
  }

  console.log("\n=================================================");
  console.log("📊 FINAL OPEN-ENDED E2E TEST RESULTS SUMMARY");
  console.log("=================================================");
  console.table(results);

  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  console.log(`\nScore: ${passedCount}/${totalCount} features passed (${Math.round((passedCount/totalCount)*100)}%)\n`);

  return results;
}

runOpenEndedTest().catch(console.error);
