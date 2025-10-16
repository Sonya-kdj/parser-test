// Часть №1 - парсер страницы товара с сайта www.vprok.ru

import puppeteer from "puppeteer";
import fs from "fs";

// получаем аргументы командной строки
const [, , url, region] = process.argv;

if (!url || !region) {
  console.error("укажите URL и регион");
  process.exit(1);
}

if (!url.startsWith("https://www.vprok.ru/product/")) {
  console.error("некорректный URL товара с сайта www.vprok.ru!");
  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
  );

  await page.setExtraHTTPHeaders({
    "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
  });

  // устанавливаем регион
  console.log(`устанавливаем регион через интерфейс: ${region}`);

  try {
    await page.goto("https://www.vprok.ru", {
      waitUntil: "domcontentloaded",
      timeout: 0,
    });

    // кликаем по текущему региону в шапке
    const regionButtonSelector = ".Region_text__Wm7FO";
    await page.waitForSelector(regionButtonSelector, { timeout: 15000 });
    await page.click(regionButtonSelector);
    console.log("открыли окно выбора региона");

    // ждём список кнопок
    const listButtonSelector = ".UiRegionListBase_button__smgMH";
    await page.waitForSelector(listButtonSelector, { timeout: 10000 });

    // находим кнопку с нужным регионом и кликаем
    const success = await page.evaluate(
      (region, selector) => {
        const buttons = Array.from(document.querySelectorAll(selector));
        const btn = buttons.find((b) => b.textContent.trim() === region);
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      },
      region,
      listButtonSelector
    );

    if (!success) throw new Error(`Регион "${region}" не найден в списке`);

    // ждем пока текст региона в шапке обновится
    await page.waitForFunction(
      (regionButtonSelector, region) => {
        const el = document.querySelector(regionButtonSelector);
        return el && el.textContent.includes(region);
      },
      { timeout: 10000 },
      regionButtonSelector,
      region
    );

    const currentRegion = await page.$eval(regionButtonSelector, (el) =>
      el.textContent.trim()
    );
    console.log(`регион успешно установлен: ${currentRegion}`);

    await page.screenshot({ path: "screenshot_region.jpg", fullPage: true });
    console.log("скриншот с регионом сохранён: screenshot_region.jpg");
  } catch (err) {
    console.warn(
      `не удалось установить регион через интерфейс: ${err.message}`
    );
    console.log("устанавливаем регион через куки");

    await page.setCookie(
      { name: "region-confirmed", value: "1", domain: ".vprok.ru" },
      {
        name: "city-name",
        value: encodeURIComponent(region),
        domain: ".vprok.ru",
      }
    );
  }

  // переход на страницу товара
  console.log(`переходим на страницу товара: ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });

  //
  try {
    await page.waitForSelector(
      ".Price_price__QzA8L, .Price_role_discount__l_tpE",
      { timeout: 15000 }
    );
  } catch {
    console.warn(
      "не удалось найти цену на странице (возможно, товар недоступен в выбранном регионе)"
    );
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await page.screenshot({ path: "screenshot.jpg", fullPage: true });
  console.log("скриншот страницы товара сохранён: screenshot.jpg");

  // парсим данные о товаре
  const productData = await page.evaluate(() => {
    const getText = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.innerText.trim() : "N/A";
    };

    const parsePrice = (text) => {
      if (!text || text === "N/A") return "N/A";
      const num = text.replace(/[^\d,\.]/g, "").replace(",", ".");
      return parseFloat(num).toFixed(2);
    };

    const parseReviewCount = (text) => {
      if (!text || text === "N/A") return "0";
      const num = text.replace(/[^\d]/g, "");
      return num || "0";
    };

    const price = parsePrice(
      getText(".Price_role_discount__l_tpE, .Price_price__QzA8L")
    );
    const priceOld = parsePrice(getText(".Price_role_old__r1uT1"));
    const rating = getText(".ActionsRow_stars__EKt42") || "N/A";
    const reviewCount = parseReviewCount(getText(".ActionsRow_reviews__AfSj_"));

    return { price, priceOld, rating, reviewCount };
  });

  console.log("данные о товаре:", productData);

  let text = `price=${productData.price}\n`;
  if (productData.priceOld !== "N/A")
    text += `priceOld=${productData.priceOld}\n`;
  text += `rating=${productData.rating}\n`;
  text += `reviewCount=${productData.reviewCount}\n`;

  fs.writeFileSync("product.txt", text, "utf8");
  console.log("данные сохранены в product.txt");

  await browser.close();
})();
