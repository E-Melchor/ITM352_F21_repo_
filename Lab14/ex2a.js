const fs = require('fs');

if (filename = './user_data.json') {
    var user_data_str = fs.readFileSync(filename, 'utf-8');
    var user_data_obj = JSON.parse(user_data_str);
    var files_stats = fs.statSync(filename);
    console.log(user_data_obj["kazman"]["password"]);
}
else {
    console.log.lg(`Hey! ${filename} does not exist!`);
}