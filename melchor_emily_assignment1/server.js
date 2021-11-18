//server code: modified from info_server_Ex5.js in Lab13

//create server framework with express package
var express = require('express');
var app = express();

//querystring package
var qs = require('querystring');

//To access inputted data from order_form.html
app.use(express.urlencoded({ extended: true }));

//products data
var products = require('./product_data.json');
app.get("/product_data.js", function(request, response) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

// monitor all requests; from info_server_Ex5.js in Lab13
app.all('*', function(request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});

// process purchase request (validate quantities, check quantity available)
products.forEach((prod, i) => { prod.total_sold = 0 });

//validate quantities on server
app.post("/purchase", function(request, response, next) {
    var errors = {};
    for (i in products) {
        let quantity = request.body['quantity_textbox' + i];
        if (typeof quantity != 'undefined') {
            if (isNonNegInt(quantity)) {
                products[i].total_sold += Number(quantity);
                console.log('data is good')
            } else {
                errors[`invalid_quantity${i}`] = `Please enter a valid quantity for ${products[i].flavor}`;
            }
        } else {
            console.log(`undefined quantity, test success!`);
        }
        //response.redirect('receipt.html?quantity=' + quantity);
        //response.redirect('receipt.html?error=Invalid%20Quantity&' + qs.stringify(request.body));
    }
    //If there's no errors, create an invoice, otherwise send back to order page with error message
    if (Object.keys(errors).length == 0) {
        response.send('put invoice here');
    } else {
        response.send(errors);
    }
});

function isNonNegInt(q, returnErrors = false) {
    //If returnErrors is true, array of errors is returned
    //others return true if q is a non-neg int.
    errors = []; // assume no errors at first
    if (q == '') q = 0;
    if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    else {
        if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
        if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
    }
    return returnErrors ? errors : (errors.length == 0);
};

// route all other GET requests to files in public 
app.use(express.static('./public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));