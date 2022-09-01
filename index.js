const app = require("express")();

let chrome = {};
let puppeteer;

// vercer run in AWS-LAMBDA SERVERS
if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  // if in production
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core"); //light puppeter
} else {
  // locally
  puppeteer = require("puppeteer"); // include chrome
}

app.get("/", async (req, res) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    let browser = await puppeteer.launch(options);

    let page = await browser.newPage();
    // await page.goto("https://www.google.com");
    await page.goto("http://www.dolar-blue.com/");

    let compraBlue = await page.$eval(
      ".values > .compra > .val",
      (el) => el.textContent
      // (el) => el.innerHTML
    );

    let ventaBlue = await page.$eval(
      ".values > .venta > .val",
      (el) => el.textContent
    );

    let actualizado = await page.$eval(
      ".update > .container",
      (el) => el.textContent
    );

    actualizado = actualizado.slice(15);

    // res.send(
    //   "\nLast Updated: " +
    //   actualizado +
    //   " - \nBuy: " +
    //   compraBlue +
    //   " - \nSell: " +
    //   ventaBlue +
    //   " \n"
    // );

    res.send(`
        <div style="
          padding: 30px; 
          display: flex;
          flex-direction: column;
          align-items: center; 
          justify-content: center;
          max-width: 350px;
          position: absolute;
          top: 50%; 
          left: 50%;
          transform: translate(-50%,-50%);
          zoom: 1.3;
          box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px
        ">
        <h1>Dolar Blue</h1>
        <h2>Exchange rate in Argentina</h2>
        <h2>Last Updated: ${actualizado}</h2>
        <h2>Buy: <b>${compraBlue}</b></h2>
        <h2>Sell: <b>${ventaBlue}</b></h2>
        </div>
    `);

    // res.send(await page.title());

    await browser.close();
  } catch (err) {
    console.error(err);
    return null;
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
