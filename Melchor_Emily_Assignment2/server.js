/*
Emily Melchor
Assignment2 Server
*/
//server code: modified from info_server_Ex5.js in Lab13

//create server framework with express
var express = require('express');
var app = express();

//javascript modules
var qs = require('querystring'); //querystring module (products display & invoice)
const fs = require('fs'); //file system module (login & registration)

//To access inputted data
app.use(express.urlencoded({ extended: true }));

//products display page
//products data
var products = require('./product_data.json');
const e = require('express');
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
        if (Number(quantity) <= inventory && isNonNegInt(quantity)) {
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

    //if there's no errors, send to login page
    if (Object.keys(errors).length == 0) {
        //response.redirect('./login_page.html?' + qstring);
        let params = new URLSearchParams(request.body);
        response.redirect('./login_page.html?' + params.toString());
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


//registration form
var filename = './user_data.json';
//have reg data file, so read data and parse into user_reg_info object
let data_str = fs.readFileSync(filename, 'utf-8');
var user_reg_info = JSON.parse(data_str);
console.log(user_reg_info);


app.post("/register", function(request, response) {
    //define new username, password, repeat password, and email
    //.toLowerCase makes case insensitive
    let new_username = request.body.username.toLowerCase();
    let new_name = request.body['name'];
    let new_password = request.body['password'];
    let confirm_password = request.body['repeat_password'];
    let new_email = request.body.email.toLowerCase();

    var reg_errors = []; //start with no errors

    //validate username value
    //Username length must be minimum 4 characters and maximum 10 characters
    if (new_username.length < 4 && new_username.length > 0) {
        reg_errors[`short_username`] = `username length is too short. `;
    } else if (new_username.length > 10) {
        reg_errors[`long_username`] = `username length is too long. `;
    } else if (new_username.length == 0) {
        reg_errors[`no_username`] = `enter a username. `;
    } else {
        //Username cannot have symbols (only letters and numbers)
        //.match from https://stackoverflow.com/questions/3853543/checking-input-values-for-special-symbols
        if (new_username.match(/^[a-zA-Z0-9_]+$/)) {
            //Check if username is already taken (need HELPPPP)
            if (typeof user_reg_info[new_username] != 'undefined') {
                response.send('username already taken');
            } else {
                console.log(`username is ${new_username}`)
            }
        } else {
            reg_errors[`username_symbols`] = `Username cannot have symbols. `;
        }
    }

    //validate name value
    //name cannot be more than 30 characters
    if (new_name.length == 0) {
        reg_errors[`no_name`] = `enter your name. `;
    } else if (new_name.length > 30) {
        reg_errors[`long_name`] = `Name cannot be more than 30 characters. `;
    } else {
        if (new_name.match(/^[a-zA-Z_]+$/)) {
            console.log(`name is ${new_name}`);
        } else {
            reg_errors[`name_nonletters`] = `Name can only consist of letters. `;
        }
    }

    //validate password value
    //password must be at least 6 characters minimum
    if (new_password.length == 0) {
        reg_errors[`no_password`] = `enter a password. `;
    } else if (new_password.length < 6) {
        reg_errors[`short_password`] = `password is too short. `;
    } else {
        console.log('password is good');
    }

    //confirm password
    if (confirm_password.length == 0) {
        reg_errors[`no_password_reenter`] = `reenter your password. `;

    } else if (new_password == confirm_password) {
        console.log('passwords match');
    } else {
        reg_errors[`passwords_no_match`] = `passwords do not match, please try again. `;
    }

    //validate email value
    if (new_email.length == 0) {
        reg_errors[`no_email`] = `enter your email. `;
    }
    //.match from https://www.w3resource.com/javascript/form/email-validation.php
    else if (new_email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
        console.log(`email is ${new_email}`);
    } else {
        reg_errors[`invalid_email`] = `email is invalid. `;
    }

    // create query string from request.body
    var qstring = qs.stringify(request.body);

    //if there's no errors, create a receipt??? or redirect to login page???
    if (Object.keys(reg_errors).length == 0) {
        response.send('no errors');
    } else {
        //generate registration error message
        let reg_error_string = '';
        for (err in reg_errors) {
            reg_error_string += reg_errors[err];
        }
        //response.send(reg_error_string);
        response.redirect('./registration.html?' + qstring + `&reg_error_string=${reg_error_string} `);
        console.log(`reg_error_string=${reg_error_string} `);
    }


    //if there are no errors, enter form values to JSON file


    //response.send(`new user ${new_username} with password as ${new_password}; repeat password ${confirm_password} and email is ${new_email}`);
    //console.log(user_reg_info);

});


//login page
//Process login form; modified from ex4.js in Lab14

app.post("/login", function(request, response) {
    // Redirect to logged in page if ok, back to login page if not
    let login_username = request.body['username'].toLowerCase();
    let login_password = request.body['password'];
    let params = new URLSearchParams(request.query);

    var log_errors = []; //start with no errors

    //check if username exists, then check password entered matched password stored
    if (typeof user_reg_info[login_username] != 'undefined') {
        if (user_reg_info[login_username].password == login_password) {
            console.log('no log in errors');
        } else {
            log_errors['incorrect_password'] = `Incorrect password for ${login_username}. Please try again.`;
        }
    } else {
        log_errors['incorrect_username'] = `Username ${login_username} is incorrect. Please try again.`;
        //response.redirect(`./login?err=${login_username} does not exist`);
    }
    if (Object.keys(log_errors).length == 0) {
        console.log(`params.toString() is ` + params.toString());
        response.redirect('./invoice.html?' + params.toString());
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