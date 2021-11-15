var express = require('express');
var app = express();
app.use(express.urlencoded({ extended: true }));

//products data
var products = require('./product_data.json');
app.get("/product_data.js", function (request, response) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

// Routing 

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

// process purchase request (validate quantities, check quantity available)
products.forEach((prod, i) => { prod.total_sold = 0 });

app.post("/purchase", function (request, response, next) {
   let flavor = products[0]['flavor'];
   let flavor_price = products[0]['price'];
   var q = request.body['quantity_textbox'];

   if (typeof q != 'undefined') {
       if (isNonNegInt(q)) {
           products[0].total_sold += Number(q);
           response.redirect('invoice.html?quantity=' + q);
       }
       else {
           response.redirect('invoice.html?error=Invalid%20Quantity&quantity_textbox=' + q);
       }
   }
   response.send(request.body); 
   //send to invoice.html?????
   next();
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