const fs = require('fs');
var express = require('express');
var app = express();

//don't need cookieParser anymore because session already has cookieParser

var session = require('express-session');
app.use(session({ secret: "MySecretKey", resave: true, saveUninitialized: true }));

app.get('/set_cookie', function(request, response) {
    //this will send a cookie to the requester
    response.cookie('name', 'Emily', { maxAge: 5 * 1000 });
    response.send('The name cookie has been sent!');
});

app.get('/use_cookie', function(request, response) {
    //this will send a cookie to the requester
    console.log(request.cookies);
    response.send(`Welcome to the Use Cookie page ${request.cookies['name']}`);
});

app.get('/use_session', function(request, response) {
    //this will send a cookie to the requester
    //console.log(request.cookies);
    response.send(`Welcome, your session ID is ${request.session.id}`);
});

var filename = './user_data.json';

if (fs.existsSync(filename)) {
    var stats = fs.statSync(filename);
    console.log(filename + 'has' + stats["size"] + 'characters');

    //have reg data file, so read data and parse into user_registration_info object
    let data_str = fs.readFileSync(filename, 'utf-8');
    var user_registration_info = JSON.parse(data_str);
    console.log(user_registration_info);

    //add new user data
    username = 'newuser';
    user_registration_info[username] = {};
    user_registration_info[username].password = 'newpass';
    user_registration_info[username].email = 'newuser@user.com';
    let new_user_data = fs.readFileSync(filename, 'utf-8')
    var user_registration_info = JSON.parse(new_user_data);

} else {
    console.log(`Hey! ${filename} does not exist!`);
}

app.get("/", function(request, response) {
    response.send('nothing here');
});

//data from form will be decoded
app.use(express.urlencoded({ extended: true }));

//create login form
app.get("/login", function(request, response) {
    // Give a simple login form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
});

//Process login form
app.post("/login", function(request, response) {
    // Redirect to logged in page if ok, back to login page if not
    let login_username = request.body['username'];
    let login_password = request.body['password'];

    //check if username exists, then check password entered matched password stored

    if (typeof user_registration_info[login_username] != 'undefined') {
        if (user_registration_info[login_username].password == login_password) {
            if (typeof request.session['last login'] != 'undefined') {
                var last_login = request.session['last login'];
            } else {
                var last_login = 'first visit!';
            }
            request.session['last login'] = new Date().toISOString(); //put login date into session
            response.send(`Your last login was on ${last_login}`);
        } else {
            response.redirect(`./login?err=incorrect password for ${login_username}`);
        }
    } else {
        response.redirect(`./login?err=${login_username} does not exist`);

    }
    //response.send('processing request' + JSON.stringify(request.body));
});

//create registration form
app.get("/register", function(request, response) {
    // Give a simple register form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
<input type="email" name="email" size="40" placeholder="enter email"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
});

app.post("/register", function(request, response) {
    // process a simple register form
    response.send('adding new user' + JSON.stringify(request.body));
    console.log(user_registration_info);
});

app.listen(8080, () => console.log(`listening on port 8080`));