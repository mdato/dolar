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
      headless: 'new',
      ignoreHTTPSErrors: true,
    };
  }

  try {
    let browser = await puppeteer.launch(options);

    let page = await browser.newPage();
    await page.goto("https://www.dolar.blue/");

    let compraBlue = parseInt(await page.$eval(
      ".panel-body > .row > .col-sm-4.col-md-4.price_border:nth-child(1) > p.price-blue",
      (el) => el.textContent
    ));
    console.log(compraBlue)

    let ventaBlue = parseInt(await page.$eval(
      ".panel-body > .row > .col-sm-4.col-md-4.price_border:nth-child(2) > p.price-blue",
      (el) => el.textContent
    ));
    
    console.log(ventaBlue);  // Esto debería imprimir "1010.0"


    // Extraer valores del dólar oficial
    let compraOficial = parseFloat(await page.$eval(
      ".panel-success .price_border:nth-child(1) p.price",
      (el) => el.textContent
    ));
    
    let ventaOficial = parseFloat(await page.$eval(
      ".panel-success .price_border:nth-child(2) p.price",
      (el) => el.textContent
    ));

    let actualizado = await page.$eval(
      ".panel-heading > .row > .col-sm-8 > p > small",
      (el) => el.textContent
    );

    console.log(actualizado)

    //actualizado = actualizado.slice(15);

    let source = "dolar.blue"
    let linkSource = "https://www.dolar.blue/"

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
        <title>Dolar Blue</title>
        <style>
            body {
                background-image: url('https://images.unsplash.com/photo-1521579772986-45a33628a34e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
                background-size: cover;
                background-position: center;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0; /* Agregamos margen 0 para evitar espacios innecesarios */
            }
    
            .info-box {
                padding: 30px;
                width: 80vw;
                
                background: rgba(255, 255, 255, 0.5);
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                border-radius: 10px;
                transform: perspective(-100px) rotateY(20deg);
                transition: transform 0.5s, box-shadow 0.5s;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
    
            .info-box:hover {
                transform: perspective(100px) rotateY(0deg);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            }
    
            
        </style>
    </head>
    <body>
    <div class="info-box">
    <div style="display: flex; align-items: center;">
    <img src="https://plus.unsplash.com/premium_photo-1675865393332-a17b9bdaa43e?q=80&w=1450&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Flag" style="width: 50px; height: auto; margin-right: 10px;">
    <h1 style="margin: 0;">ARGENTINA</h1>
</div>

            <h1>Dolar Blue (informal)</h1>
            
            <div style="display: inline-block; white-space: nowrap;">
                <h2 style="display: inline;">Buy: </h2><h1 style="display: inline; margin: 0;">$ ${compraBlue}</h1>&nbsp;&nbsp;&nbsp;
                <h2 style="display: inline;">Sell: </h2><h1 style="display: inline; margin: 0;">$ ${ventaBlue}</h1>
            </div>
            <h3>Official Rate</h3>
            <div style="display: inline-block; white-space: nowrap;">
              <h3 style="display: inline;">Buy: </h3><h2 style="display: inline; margin: 0;">$ ${compraOficial.toFixed(2)}</h2>&nbsp;&nbsp;&nbsp;
              <h3 style="display: inline;">Sell: </h3><h2 style="display: inline; margin: 0;">$ ${ventaOficial.toFixed(2)}</h2>
            </div>
            <h3>Updated: ${actualizado}</h3>
            <h4 style="color: black;"><b>Source:</b> <a href=${linkSource} target="_blank" style="text-decoration: none; color: black; cursor: pointer;">${source}</a></h4>
        </div>
    </body>
    </html>
    
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
