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
      // (el) => el.innerHTML
    );

    let actualizado = await page.$eval(
      ".update > .container",
      (el) => el.textContent
      //(el) => el.innerHTML
    );

    actualizado = actualizado.slice(15);

    res.send(
      "\nLast Updated: " +
      actualizado +
      " - \nBlue Buy: " +
      compraBlue +
      " - \nBlue Sell: " +
      ventaBlue +
      " \n"
    );

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
