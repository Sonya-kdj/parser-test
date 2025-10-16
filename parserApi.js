//Часть №2 - парсер категории с сайта

import puppeteer from "puppeteer";
import fs from "fs";

const categoryUrl = process.argv[2];
if (!categoryUrl) {
  console.error("укажите ссылку категории,  например:");
  console.error(
    "   node parserPuppeteer.js https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory"
  );
  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(categoryUrl, { waitUntil: "networkidle2" });

  // ждём пока появятся карточки
  await page.waitForSelector("a.UiProductTileMain_longName__29CCd", {
    timeout: 20000,
  });
  // прокручиваем страницу вниз, чтобы подгрузились все товары
  const products = await page.evaluate(() => {
    const names = document.querySelectorAll(
      "a.UiProductTileMain_longName__29CCd"
    );
    const ratings = document.querySelectorAll(
      "a.UiProductButtonRating_rating__I6GGP"
    );
    const reviews = document.querySelectorAll(
      "a.UiProductButtonRating_reviews__w_V1_"
    );
    const oldPrices = document.querySelectorAll(".Price_role_old__r1uT1");
    const prices = document.querySelectorAll(".Price_role_discount__l_tpE");
    const discounts = document.querySelectorAll(".Purchase_discount__fPiSP");
    // собираем данные в массив объектов
    const items = [];
    for (let i = 0; i < names.length; i++) {
      const nameEl = names[i];
      const ratingEl = ratings[i];
      const reviewEl = reviews[i];
      const priceEl = prices[i];
      const oldPriceEl = oldPrices[i];
      const discountEl = discounts[i];
      // извлекаем текстовое содержимое и ссылки
      const name = nameEl?.getAttribute("title")?.trim() || "N/A";
      const link = nameEl
        ? `https://www.vprok.ru${nameEl.getAttribute("href")}`
        : "N/A";
      const rating = ratingEl?.innerText.trim() || "N/A";
      const reviewCount = reviewEl?.innerText.replace(/\D/g, "") || "N/A";
      const price = priceEl?.innerText.replace(/[^\d]/g, "") || "N/A";
      const oldPrice = oldPriceEl?.innerText.replace(/[^\d]/g, "") || "";
      const discount = discountEl?.innerText.replace(/[^\d-]/g, "") || "";

      items.push({
        name,
        link,
        rating,
        reviewCount,
        price,
        oldPrice,
        discount,
      });
    }
    return items;
  });

  if (!products.length) {
    console.error("не удалось извлечь товары со страницы");
    await browser.close();
    process.exit(1);
  }
  // сохраняем результаты в файл
  const lines = products.map((p) =>
    [
      `Название товара: ${p.name}`,
      `Ссылка на страницу товара: ${p.link}`,
      `Рейтинг: ${p.rating}`,
      `Количество отзывов: ${p.reviewCount}`,
      `Цена: ${p.price}`,
      `Акционная цена: ${p.discount ? p.price : ""}`,
      `Цена до акции: ${p.oldPrice}`,
      `Размер скидки: ${p.discount}`,
    ].join("\n")
  );
  // разделяем товары пустой строкой
  fs.writeFileSync("products-api.txt", lines.join("\n\n"), "utf8");
  console.log(
    ` Собрано ${products.length} товаров. данные сохранены в products-api.txt`
  );

  await browser.close();
})();
