//server code: modified from info_server_Ex5.js; Lab13
var express = require('express');
var app = express();

//To access inputted data from order_form.html
app.use(express.urlencoded({ extended: true }));
var qs = require('querystring');

//products data
var products = require('./product_data.json');
app.get("/product_data.js", function(request, response) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

// monitor all requests
app.all('*', function(request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});

// process purchase request (validate quantities, check quantity available)
products.forEach((prod, i) => { prod.total_sold = 0 });

app.post("/purchase", function(request, response, next) {
    var errors = {}; //start with no errors
    for (i in products) {
        let quantity = request.body['quantity_textbox' + i]; //access quantities entered from order form
        //check if there is a quantity
        if (quantity.length !== 0) {
            //check if quantity is a non-negative integer
            if (isNonNegInt(quantity)) {
                products[i].total_sold += Number(quantity);
                console.log('data is good')
            }
            //if quantity is not a non-negative integer, add error
            else {
                errors[`invalid_quantity${i}`] = `Please enter a valid quantity for ${products[i].flavor}`;
            }
        }
        //if there is no quantity
        else {
            //stay on order form and add message
            response.redirect('./order_form.html?');
        }
        //response.redirect('receipt.html?quantity=' + quantity);
        //response.redirect('receipt.html?error=Invalid%20Quantity&' + qs.stringify(request.body));
    }
    //if there's no errors, create an invoice, otherwise send back to order page with error message
    if (Object.keys(errors).length == 0) {
        response.redirect('./receipt.html?quantity=')
            //response.send('put invoice here');

    } else {
        //create error message

        //send back to order page with error message
        response.redirect('./order_form.html?');
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