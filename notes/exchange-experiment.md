title: How to do currency exchanging easy to NOT get more money?
-----
image: 

![pexels-cottonbro-3943748](https://user-images.githubusercontent.com/12833067/142818084-e65b2687-cb7b-430a-aa70-f2554a2c93f5.jpg)

Photo by cottonbro from Pexels
-----
### How to not make money while exchanging currency?

I am glad that you asked this. I have a clear answer to this question.

### What is it?

You should exchange some of your money for another currency. Let's have UAH USD pair. We can exchange 25 UAH for 1 USD on day one. Wait till the exchange rate change and exchange back from USD to UAH. Another day we have a rate like 1 USD for 26 UAH. It is a good one because we can earn 4% from that deal. You shouldn't think about inflation for now. So now we have 26 UAH. You want to wait until the day when you will get more than 1 USD we would not go decrease our bank. And so on...

### How to prove that this would work?

The best thighs that came to my head were to download 1 year of exchange rates and run this algorithm on this data.

### That's fine. Can we get more details on this?

Say no more. Start with data. I prepare the list so you can get it [here]. I speak JavaScript so I hope you would understand it too...

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

### Nice. What results did you get?

Well... We exchange only once and didn't get a chance to exchange USD back to UAH.

### Should we try another day as a start point?

That is a good question. Give me a second to adjust the algorithm to get the answer.

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

We will get 100 UAH as the best results, since this is our initial bank I'll not recommend you to follow this algorithm.

### Cool, I'll not do this. Anything else?

Yes, I want to know if this algorithm has a name. And do you want to read more about similar things I just have one more idea to explore?
