var express = require('express');
var app = express();
var fs = require('fs');

var errors = {}; // keep errors on server to share with registration page

app.use(express.urlencoded({ extended: true }));

// user info JSON file
var filename = "./user_data.json";


if (fs.existsSync(filename)) {
    var stats = fs.statSync(filename);
    data = fs.readFileSync(filename, 'utf-8');
    users_reg_data = JSON.parse(data);
} else {
    console.log(filename + ' does not exist!');
    users_reg_data = {};
}

app.get("/register", function(request, response) {
    // Give a simple register form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" > 
${ (typeof errors['no_username'] != 'undefined')?errors['no_username']:''}
${ (typeof errors['username_taken'] != 'undefined')?errors['username_taken']:''}
<br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="password" name="repeat_password" size="40" placeholder="enter password again">
${ (typeof errors['password_mismatch'] != 'undefined')?errors['password_mismatch']:''}
<br />
<input type="email" name="email" size="40" placeholder="enter email"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);

});

app.post("/register", function(request, response) {
    // process a simple register form
    username = request.body.username.toLowerCase();

    // check is username taken
    if (typeof users_reg_data[username] != 'undefined') {
        errors['username_taken'] = `Hey! ${username} is already registered!`;
    }
    if (request.body.password != request.body.repeat_password) {
        errors['password_mismatch'] = `Repeat password not the same as password!`;
    }
    if (request.body.username == '') {
        errors['no_username'] = `You need to select a username!`;
    }
    if (Object.keys(errors).length == 0) {
        users_reg_data[username] = {};
        users_reg_data[username].password = request.body.password;
        users_reg_data[username].email = request.body.email;
        fs.writeFileSync(filename, JSON.stringify(users_reg_data));
        console.log("Saved: " + users_reg_data);
        response.send(`${username} has been registered.`);
    } else {
        response.redirect("./register");
    }
});

var listener = app.listen(8080, () => { console.log('server started listening on port ' + listener.address().port) });