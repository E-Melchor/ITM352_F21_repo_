//server code: modified from info_server_Ex5.js in Lab13

//Javascript modules
var express = require('express');
var app = express();
var qs = require('querystring');
const fs = require('fs'); //file system module (login & registration)
var session = require('express-session');
app.use(session({ secret: "MySecretKey", resave: true, saveUninitialized: true }));

//To access inputted data
app.use(express.urlencoded({ extended: true }));

// monitor all requests; from info_server_Ex5.js in Lab13
app.all('*', function(request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});

//--------------------PRODUCTS--------------------
//products data
var products = require('./product_data.json');
app.get("/product_data.js", function(request, response) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

// process purchase request (validate quantities, check quantity available)
products.forEach((prod, i) => { prod.total_sold = 0 });

//route to validate quantities on server
app.post("/purchase", function(request, response, next) {
    var errors = []; //start with no errors
    var has_quantity = false; //start with no quantity

    //use loop to validate all product quantities
    for (i in products) {
        //access quantities entered from order form
        let quantity = request.body['quantity_textbox' + i];
        //check if there is a quantity; if not, has_quantity will still be false
        if (quantity.length > 0) {
            has_quantity = true;
        } else {
            continue;
        }
        //check if quantity is a non-negative integer
        if (has_quantity == true && isNonNegInt(quantity)) {
            products[i].total_sold += Number(quantity);
        }
        //if quantity is not a non-negative integer, add error (invalid quantity)
        else {
            errors[`invalid_quantity${i}`] = `Please enter a valid quantity for ${products[i].flavor}! `;
        }
        //check if there is enough in inventory
        //access quantity_available from json file
        let inventory = products[i].quantity_available;
        //if quantity ordered is less than or same as the amount in inventory, reduce inventory by quantity ordered amount 
        if (Number(quantity) <= inventory) {
            products[i].quantity_available -= Number(quantity);
            console.log(`${products[i].quantity_available} is new inventory amount`);
        }
        //if there's not enough in inventory, add error (quantity too large)
        else {
            errors[`invalid_quantity${i}`] = `Please order a smaller amount of ${products[i].flavor}! `;
        }
    }
    //if there are no quantities, send back to order page with message (need quantities)
    if (has_quantity == false) {
        errors['missing_quantities'] = 'Please enter a quantity!';
    }

    // create query string from request.body
    var qstring = qs.stringify(request.body);

    //if there's no errors, create a receipt
    if (Object.keys(errors).length == 0) {
        response.redirect('./invoice.html?' + qstring);
    } else {
        //if there's errors
        //generate error message based on type of error
        let error_string = ''; //start with empty error string
        for (err in errors) {
            error_string += errors[err];
            //for each error, add error message to overall error_string
        }
        //send back to order page with error message
        response.redirect('./products_display.html?' + qstring + `&error_string=${error_string}`);
        console.log(`error_string=${error_string}`);
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

//--------------------REGISTRATION--------------------
var filename = './user_data.json';
//have reg data file, so read data and parse into user_reg_info object
let data_str = fs.readFileSync(filename, 'utf-8');
var user_reg_info = JSON.parse(data_str);
console.log(user_reg_info);

//--------------------LOGIN--------------------
//Process login form; modified from ex4.js in Lab14

app.post("/login", function(request, response) {
    // Redirect to logged in page if ok, back to login page if not
    let username = request.body.username.toLowerCase();
    let password = request.body['password'];
    var log_errors = []; //start with no errors

    //check if username exists, then check password entered matched password stored
    if (typeof user_reg_info[username] != 'undefined') {
        if (user_reg_info[username].password == password) {
            console.log('no errors for login');
        } else {
            log_errors['incorrect_password'] = `Incorrect password for ${username}. Please try again.`;
        }
    } else {
        log_errors['incorrect_username'] = `Username ${username} is incorrect. Please try again.`;
        //response.redirect(`./login?err=${username} does not exist`);
    }
    if (Object.keys(log_errors).length == 0) {
        response.cookie('username', username);
        console.log(`${username} is logged in`);

        response.redirect('./index.html?' + username);
    } else {
        //generate registration error message
        let log_error_string = '';
        for (err in log_errors) {
            log_error_string += log_errors[err];
        }
        //response.send(reg_error_string);
        response.redirect('./login_page.html?' + `&log_error_string=${log_error_string} `);
        console.log(`log_error_string=${log_error_string} `);
    }
});

// route all other GET requests to files in public 
app.use(express.static('./public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));