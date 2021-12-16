/*Emily Melchor
Server
Modified from Multi_Page_Nav and simple_shopping_cart examples*/
var express = require('express');
var app = express();
var myParser = require("body-parser");
var session = require('express-session');
var products_data = require('./products.json');
var nodemailer = require('nodemailer');
var qs = require('qs');
const fs = require('fs');

app.use(myParser.urlencoded({ extended: true }));
app.use(session({ secret: "ITM352 rocks!", resave: false, saveUninitialized: true }));

app.all('*', function(request, response, next) {
    // need to initialize an object to store the cart in the session. We do it when there is any request so that we don't have to check it exists
    // anytime it's used
    if (typeof request.session.cart == 'undefined') { request.session.cart = {}; }
    next();
});

//--------------------PRODUCTS + CART--------------------
app.get("/get_products_data", function(request, response) {
    response.json(products_data);
});

app.use(function(request, response, next) {
    if (request.path != "/display_products.html") { return next(); }
    if (typeof request.query['Submit'] != 'undefined') {
        let tmp = request.query;
        delete tmp["Submit"];
        request.session.cart = tmp;
    }

    if (typeof request.session.cart != 'undefined') {
        request.query = Object.assign(request.query, request.session.cart);
    }

    request.path = `${request.path}?${qs.stringify(request.query)}`;
    console.log('session:', request.session);
    return next();
});

app.get("/add_to_cart", function(request, response) {
    var products_key = request.query['products_key']; // get the product key sent from the form post
    var quantities = request.query['quantities'].map(Number); // Get quantities from the form post and convert strings from form post to numbers
    request.session.cart[products_key] = quantities; // store the quantities array in the session cart object with the same products_key. 
    response.redirect('./cart.html');
});

app.get("/get_cart", function(request, response) {
    response.json(request.session.cart);
});

app.get("/checkout", function(request, response) {
    // Generate HTML invoice string
    var invoice_str = `Thank you for your order!<table border><th>Quantity</th><th>Item</th>`;
    var shopping_cart = request.session.cart;
    for (product_key in products_data) {
        for (i = 0; i < products_data[product_key].length; i++) {
            if (typeof shopping_cart[product_key] == 'undefined') continue;
            qty = shopping_cart[product_key][i];
            if (qty > 0) {
                invoice_str += `<tr><td>${qty}</td><td>${products_data[product_key][i].name}</td><tr>`;
            }
        }
    }
    invoice_str += '</table>';
    // Set up mail server. Only will work on UH Network due to security restrictions
    var transporter = nodemailer.createTransport({
        host: "mail.hawaii.edu",
        port: 25,
        secure: false, // use TLS
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });
    var user_email = 'phoney@mt2015.com';
    var mailOptions = {
        from: 'phoney_store@bogus.com',
        to: user_email,
        subject: 'Your phoney invoice',
        html: invoice_str
    };
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            invoice_str += '<br>There was an error and your invoice could not be emailed :(';
        } else {
            invoice_str += `<br>Your invoice was mailed to ${user_email}`;
        }
        response.send(invoice_str);
    });

});

//--------------------REGISTRATION--------------------
//Process registration form; from Assignment 2
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
//Process login form; from Assignment 2

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

app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`));