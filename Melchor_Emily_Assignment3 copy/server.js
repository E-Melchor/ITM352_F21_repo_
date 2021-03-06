/*Emily Melchor
server code modified from Assignments 1 and 2, Multi_Page_Nav example*/

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
//products data (name + img for home page)
var home_products = require('./home_products.json');
app.get("/home_products.js", function(request, response) {
    response.type('.js');
    var products_str = `var home_products = ${JSON.stringify(home_products)};`;
    response.send(products_str);
});
//products data
var products_data = require('./products_data.json');
app.get("/get_products_data", function(request, response) {
    response.json(products_data);
});

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

app.post("/register", function(request, response) {
    //define new username, password, repeat password, and email
    //.toLowerCase makes case insensitive
    var username = request.body.username.toLowerCase();
    var name = request.body['name'];
    var password = request.body['password'];
    var repeat_password = request.body['repeat_password'];
    var email = request.body.email.toLowerCase();
    var reg_errors = {}; //start with no errors

    //-------validate username value-------
    //Username length = min. 4 characters and max. 10 characters
    if (username.length < 4 || username.length > 10) {
        reg_errors[`username`] = `Username must be between 4 and 10 characters.`;
    } else if (username.length == 0) {
        reg_errors[`username`] = `Enter a username. `;
    }
    //Username = only letters and numbers
    //.match from https://stackoverflow.com/questions/3853543/checking-input-values-for-special-symbols
    if (username.match(/^[a-zA-Z0-9_]+$/) == false) {
        reg_errors[`username`] = `Username can only consist of letters and numbers. `;
    }
    //Username is already taken
    if (typeof user_reg_info[username] != 'undefined') {
        reg_errors[`username`] = `Username is already taken. `;
    }
    //-------validate name value-------
    //name cannot be more than 30 characters
    if (name.length == 0) {
        reg_errors[`name`] = `Enter your full name. `;
    } else if (name.length > 30) {
        reg_errors[`name`] = `Name cannot be more than 30 characters. `;
    }
    //name can only have letters
    if (name.match(/^[a-zA-Z_]+$/) == false) {
        reg_errors[`name`] = `Name can only consist of letters. `;
    }
    //-------validate password value-------
    //password must be at least 6 characters minimum
    if (password.length == 0) {
        reg_errors[`password`] = `Enter a password. `;
    } else if (password.length < 6) {
        reg_errors[`password`] = `Password is too short. `;
    }
    //-------validate reentered password value-------
    if (repeat_password.length == 0) {
        reg_errors[`repeat_password`] = `Reenter your password. `;
    } else if (password == repeat_password) {
        console.log('passwords match');
    } else {
        reg_errors[`repeat_password`] = `Passwords do not match, please try again. `;
    }
    //-------validate email value-------
    if (email.length == 0) {
        reg_errors[`email`] = `Enter your email. `;
    }
    //.match from https://www.w3resource.com/javascript/form/email-validation.php
    else if (email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
        console.log(`email is ${email}`);
    } else {
        reg_errors[`email`] = `Email is invalid. `;
    }

    //if there's no errors, add registration info to user_data.json, log in user, and redirect to invoice
    if (Object.keys(reg_errors).length == 0) {
        user_reg_info
        user_reg_info[username] = {};
        user_reg_info[username].name = request.body.name;
        user_reg_info[username].password = request.body.password;
        user_reg_info[username].email = request.body.email;
        fs.writeFileSync(filename, JSON.stringify(user_reg_info));
        response.redirect(`./invoice.html?`);
    } else {
        let errs_obj = { "reg_errors": JSON.stringify(reg_errors) };
        let params = new URLSearchParams(errs_obj);
        params.append('reg_data', JSON.stringify(request.body)); //put reg data into params
        params.append('username', request.body.username); //put username into params
        params.append('email', request.body.email); //put username into params
        params.append('name', request.body.name); //put username into params
        response.redirect(`./registration.html?` + params.toString());
    }
});

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