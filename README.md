# parser-test

## Часть №1

Необходимо создать JS-скрипт для Node, который с помощью библиотеки puppeteer выбирает регион, делает полноразмерный скриншот страницы товара на сайте www.vprok.ru, а также получает из нее цену товара (если есть зачеркнутая, то две цены), рейтинг товара и количество отзывов на товар.

Скриншот надо сохранить на диск с именем screenshot.jpg.

Цены, рейтинг и количество отзывов надо сохранить на диск в файл product.txt.

Скрипт должен принимать два аргумента - адрес ссылки страницы товара, которую надо обработать и регион.

файл с характеристиками товара product.txt с содержимым:

price=89.9

priceOld=134

rating=4.8

reviewCount=780

Примеры ссылок страниц товаров :

https://www.vprok.ru/product/domik-v-derevne-dom-v-der-moloko-ster-3-2-950g--309202

https://www.vprok.ru/product/domik-v-derevne-dom-v-der-moloko-ster-2-5-950g--310778

https://www.vprok.ru/product/makfa-makfa-izd-mak-spirali-450g--306739

https://www.vprok.ru/product/greenfield-greenf-chay-gold-ceyl-bl-pak-100h2g--307403

https://www.vprok.ru/product/chaykofskiy-chaykofskiy-sahar-pesok-krist-900g--308737

https://www.vprok.ru/product/lavazza-kofe-lavazza-1kg-oro-zerno--450647

https://www.vprok.ru/product/parmalat-parmal-moloko-pit-ulster-3-5-1l--306634

https://www.vprok.ru/product/perekrestok-spmi-svinina-duhovaya-1kg--1131362

https://www.vprok.ru/product/vinograd-kish-mish-1-kg--314623

https://www.vprok.ru/product/eko-kultura-tomaty-cherri-konfetto-250g--946756

https://www.vprok.ru/product/bio-perets-ramiro-1kg--476548

https://www.vprok.ru/product/korkunov-kollektsiya-shokoladnyh-konfet-korkunov-iz-molochnogo-shokolada-s-fundukom-karamelizirovannym-gretskim-orehom-vafley-svetloy-orehovoy--1295690

https://www.vprok.ru/product/picnic-picnic-batonchik-big-76g--311996

https://www.vprok.ru/product/ritter-sport-rit-sport-shokol-tsel-les-oreh-mol-100g--305088

https://www.vprok.ru/product/lays-chipsy-kartofelnye-lays-smetana-luk-140g--1197579

## Часть №2
Необходимо разработать скрипт на Node.js, который собирает данные о товарах из категории с сайта www.vprok.ru при помощи запросов к API с помощью библиотеки puppeteer или axios (на ваше усмотрение)

В этом варианте парсинга не нужно реализовывать выбор города и делать скриншоты страниц. Пагинацию обрабатывать не нужно. Собираем данные о товарах только с первой страницы категории.

Описание задачи:

Парсер должен принимать в качестве входного параметра ссылку на категорию товаров : https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory
Необходимо проанализировать сетевые запросы сайта с помощью браузерных инструментов разработчика и найти API-запросы, которые возвращают данные о товарах в указанной категории.
На основании найденного API-запроса реализовать сбор данных о товарах из категории.
Данные о каждом товаре должны быть сохранены в текстовый файл products-api.txt в следующем формате:
Название товара: [Название]

Ссылка на страницу товара: [пример]

Рейтинг: [Рейтинг товара]

Количество отзывов: [Количество отзывов]

Цена: [Цена]

Акционная цена: [Акционная цена, если есть]

Цена до акции: [Цена до акции (зачеркнутая), если есть]

Размер скидки: [Размер скидки, если есть]

Пример запуска:

node https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory

# Стек технологий

Node.js

Puppeteer

JavaScript (ESM)

fs (File System)
