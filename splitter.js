const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const splitMap = new Map();

app.use(bodyParser.urlencoded({ extended: true }));

function generateTable(qty, ppl) {
    if (qty <= 0) {
        return "Please enter a quantity above 0.";
    } else {
        let formHTML = '<form action="/calculate" method="post">';
        formHTML += '<input type="hidden" name="qty" value="' + qty + '">'; // Adding a hidden input field for quantity

        for (let i = 1; i <= qty; i++) {
            formHTML += "Item " + i + ' <input type="text" id="item_name_' + i + '" name="item_names[]" required>';
            formHTML += " Price " + '  <input type="number" id="price_item_' + i + '" name="prices[]" value="0" required step = "0.1">'; // Added name attribute for prices
            ppl.forEach(function(person, index) {
                formHTML += ' <label for="splitter_checkbox_' + i + '_' + index + '">' + person.trim() + '</label>'; // Added labels for checkboxes
                formHTML += ' <input type="checkbox" id="splitter_checkbox_' + i + '_' + index + '" name="splitter_checkboxes_' + i + '[]" value="' + person.trim() + '">'; // Added name attribute for checkboxes
            });
            formHTML += '<br>';
        }

        formHTML += '<input type="submit" value="Submit">';
        formHTML += '</form>';

        return formHTML;
    }
}

app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Generate Table</title>
        </head>
        <body>
            <h1>Grocery Price Splitter</h1>
            <form action="/submit" method="post">
                <label for="qty">Enter Number of Items:</label>
                <input type="number" id="qty" name="qty" value="0">
                <br>
                <label for="ppl">Enter Names of Splitters, separated by comma:</label>
                <input type="text" id="ppl" name="ppl">
                <br>
                <input type="submit" value="Generate Table">
                <button type="reset" id="reset">Reset</button>
            </form>
            <div id="display"></div>
        </body>
        </html>
    `);
});

app.post('/submit', (req, res) => {
    const qty = parseInt(req.body.qty);
    const ppl = req.body.ppl.split(',');
    let formHTML = `
    <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Generate Table</title>
        </head>
        <body>
        <h1>Grocery Price Splitter</h1>`
    formHTML += generateTable(qty, ppl) + "</body></html>"
    res.send(formHTML);
});

app.post('/calculate', (req, res) => {
    const qty = parseInt(req.body.qty);
    const prices = req.body.prices;

    let totalPrice = 0;
    for (let i = 0; i < qty; i++) {
        totalPrice += parseFloat(prices[i]);
    }

    let htmlOutput = '<h2>Results:</h2>';
    htmlOutput += `Quantity: ${qty}, Total Price: ${totalPrice.toFixed(2)}`;

    for (let i = 0; i < qty; i++) {
        const price = prices[i];
        const splitterCheckboxes = req.body['splitter_checkboxes_' + (i + 1)] || [];
        const numSplitters = splitterCheckboxes.length;
        const splitAmount = numSplitters > 0 ? price / numSplitters : 0;

        if (numSplitters > 0) {
            htmlOutput += `<ul>`;
            splitterCheckboxes.forEach(splitter => {
                const currentAmount = splitMap.get(splitter) || 0;
                splitMap.set(splitter, currentAmount + splitAmount);
            });
            htmlOutput += `</ul>`;
        }
    }
    
    splitMap.forEach((amount, splitter) => {
        htmlOutput += `<li>${splitter} owes ${amount.toFixed(2)}</li>`;
    });
    htmlOutput += '</ul>';

    res.send(htmlOutput);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
