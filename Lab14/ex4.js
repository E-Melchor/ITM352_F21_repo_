const fs = require('fs');
var express = require('express');
const { join } = require('path');
const { json } = require('express');
var app = express();

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
        if (user_registration_info[login_username]["password"] == login_password) {
            response.send(`${login_username} is logged in`);
        } else {
            response.redirect(`./login?err=incorrect password for ${login_username}`);
        }
    } else {
        response.redirect(`./login?err=${login_username} does not exist`);

    }
    response.send('processing request' + JSON.stringify(request.body));
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