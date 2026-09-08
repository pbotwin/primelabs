import { chromium } from "playwright-core";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
});
const context = await browser.newContext();
context.setDefaultTimeout(5000);
const sizes = [
  [360, 800],
  [390, 844],
  [768, 1024],
  [1440, 900],
];
for (const [width, height] of sizes) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:4188", { waitUntil: "domcontentloaded" });
  const missingAnchors = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="#"]')]
      .map((link) => link.getAttribute("href"))
      .filter((href) => href && href !== "#" && !document.querySelector(href)),
  );
  if (missingAnchors.length)
    throw new Error(`Broken anchors: ${missingAnchors.join(", ")}`);
  await page.locator(".product-card").first().waitFor();
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  const cards = await page.locator(".product-card").count();
  if (overflow || cards !== 22 || errors.length)
    throw new Error(
      `${width}px: overflow=${overflow}, cards=${cards}, errors=${errors.join(" | ")}`,
    );
  await page.screenshot({
    path: `reference/react-${width}.png`,
    fullPage: true,
  });
  await page.close();
}
const page = await context.newPage();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:4188", { waitUntil: "domcontentloaded" });
await page.locator(".category").nth(1).click();
if ((await page.locator(".product-card").count()) !== 2)
  throw new Error("Category filter failed");
await page.getByRole("button", { name: /ძიება|Search/ }).click();
const searchScroll = await page.evaluate(() => scrollY);
await page.getByRole("searchbox").fill("BCAA");
if ((await page.locator(".product-card").count()) !== 2)
  throw new Error("Cross-category search failed");
if ((await page.evaluate(() => scrollY)) !== searchScroll)
  throw new Error("Typing in search changed scroll position");
await page.getByRole("searchbox").fill("მაგნიუმი");
if ((await page.locator(".product-card").count()) !== 2)
  throw new Error("Georgian product search failed");
await page.getByRole("searchbox").fill("no-such-product");
if ((await page.locator(".product-card").count()) !== 0)
  throw new Error("Search empty state failed");
await page.getByRole("button", { name: /გასუფთავება|Clear filters/ }).click();
if ((await page.locator(".product-card").count()) !== 22)
  throw new Error("Reset failed");
await page.locator("#product-grid-anchor").click({ position: { x: 2, y: 2 } });
if ((await page.locator(".search-panel").count()) !== 0)
  throw new Error("Outside click did not close search");
await page.locator(".category").nth(1).click();
await page.locator(".logo").click();
if ((await page.locator(".product-card").count()) !== 22)
  throw new Error("Logo did not reset catalog filters");
await page.locator(".save").first().click();
if ((await page.locator(".counter").textContent()) !== "1")
  throw new Error("Saved products failed");
await page.locator(".product-title").first().click();
if (!(await page.locator(".product-dialog").isVisible()))
  throw new Error("In-app product details failed");
if (!page.url().startsWith("http://127.0.0.1:4188"))
  throw new Error("Product card left the app");
await page.locator(".product-dialog .button.primary").click();
if (!(await page.locator(".cart-drawer").isVisible()))
  throw new Error("Local add-to-cart failed");
if (!page.url().startsWith("http://127.0.0.1:4188"))
  throw new Error("Cart left the app");
await page.locator(".cart-drawer>footer .button.primary").click();
if (!(await page.locator(".checkout-form").isVisible()))
  throw new Error("Checkout form failed");
await browser.close();
console.log(
  "React storefront verified at 360px, 390px, 768px, and 1440px, including product and checkout flows.",
);
