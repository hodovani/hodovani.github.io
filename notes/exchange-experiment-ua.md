Як обмінювати валюту аби НЕ заробити більше?
-----
### Як не заробити обмінюючи валюту?

Добре, що запитали. Є відповідь на це питання...

Треба обміняти трохи гривень на долари. Припустимо ми обмінюємо за курсом банку 25 ГРН на 1 ДОЛ. Чекаємо поки курс зміниться на нашу користь. Іншим днем маємо курс 26 ГРН за 1 ДОЛ. Цей курс задовільняє вимогу. Ми можемо заробити 4% на цьому обміні. Зараз у нас 26 ГРН. Треба зачекати курсу коли ми зможемо отримати понад 1 ДОЛ. Тоді міняємо і знову чекаємо...

### Як перевірити, що це працює?

Беремо курс валют за рік одного з банків і тестуємо алгоритм на цих даних.

### Ок. Показуй?

Починаємо з даних. Я підготував їх [тут](https://gist.github.com/hodovani/16fe940ee59479986ae10da209a871dc#file-currency-csv). Приклад буде на JavaScript, але це не повинно заважати зрозуміти хід думок...

```javascript
const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");

// Initial conditions
const states = { UAH2USD: "UAH2USD", USD2UAH: "USD2UAH" };
let uah = 100;
let prevUah = uah;
let usd = 0;
let prevUsd = usd;
let state = states.UAH2USD;

// Loop through the exchange rates list
fs.createReadStream(path.resolve(__dirname, "currency.csv"))
  .pipe(csv.parse({ headers: true }))
  .on("error", (error) => console.error(error))
  .on("data", ({ Buy, Sell }) => {
    const buy = parseFloat(Buy);
    const sell = parseFloat(Sell);
    if (state === states.UAH2USD) {
      if (uah / sell > prevUsd) {
        usd = uah / sell;
        prevUah = uah;
        uah = 0;
        state = states.USD2UAH;
      }
    } else if (state === states.USD2UAH) {
      if (usd * buy > prevUah) {
        uah = usd * buy;
        prevUsd = usd;
        usd = 0;
        state = states.UAH2USD;
      }
    } else {
      console.error("???");
    }
  })
  .on("end", (rowCount) => {
    console.log(uah);
    console.log(usd);
  });
```

### Так. Які результати?

Ну... Ми обміняли валюти тільки один раз...

### Може треба спробувати інший день як початкову точку?

Слушне зауваження. Зараз зробимо необхідні зміни.

```javascript
const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");

// Initial conditions
let exchangeRates = [];
let bestUah = 0;

fs.createReadStream(path.resolve(__dirname, "currency.csv"))
  .pipe(csv.parse({ headers: true }))
  .on("error", (error) => console.error(error))
  .on("data", ({ Buy, Sell }) => {
    exchangeRates.push({ Buy, Sell });
  })
  .on("end", () => {
    for (
      let startPoint = 0;
      startPoint < exchangeRates.length - 1;
      startPoint++
    ) {
      const states = { UAH2USD: "UAH2USD", USD2UAH: "USD2UAH" };
      let uah = 100;
      let prevUah = uah;
      let usd = 0;
      let prevUsd = usd;
      let state = states.UAH2USD;

      for (let i = startPoint; i < exchangeRates.length; i++) {
        const buy = parseFloat(exchangeRates[i].Buy);
        const sell = parseFloat(exchangeRates[i].Sell);
        if (state === states.UAH2USD) {
          if (uah / sell > prevUsd) {
            usd = uah / sell;
            prevUah = uah;
            uah = 0;
            state = states.USD2UAH;
          }
        } else if (state === states.USD2UAH) {
          if (usd * buy > prevUah) {
            uah = usd * buy;
            prevUsd = usd;
            usd = 0;
            state = states.UAH2USD;
          }
        } else {
          console.error("???");
        }
      }

      if (
        bestUah <
        uah + usd * parseFloat(exchangeRates[exchangeRates.length - 1].Buy)
      ) {
        bestUah =
          uah + usd * parseFloat(exchangeRates[exchangeRates.length - 1].Buy);
      }
    }

    console.log(bestUah);
  });
```

Хм... Ми отримали 100 ГРН як найкращий результат. Це самі стільки скільки ми використали спочатку. Може це не найкращий рік аби робити такі операції...

### Шкода, щось ще додаси?

Так, було б добре дізнатись чи у цього алгоритму є назва. А ще є одна ідея як вдосконалити вже написаний алгоритм. Чи цікаво буде дізнатись?

