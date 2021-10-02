var month = "Month";
var num_days;
switch (month) {
    case "January" : 
        num_days = 30;
        break;
    case "February" :
        num_days = 28;
        break;
    case "March" :
        num_days = 31;
        break;
    case "April" : 
        num_days = 30;
        break;
    case "May" :
        num_days = 31;
        break;
    case "June" :
        num_days = 30;
        break;
    case "July" :
        num_days = 31;
        break;
    case "August" : 
        num_days = 31;
        break;
    case "September" :
        num_days = 30;
        break;
    case "October" :
        num_days = 31;
        break;
    case "November" :
        num_days = 30;
        break;
    case "December" :
        num_days = 31;
        break;
    default :
        num_days = -1;
}
console.log (`${month} has ${num_days} days.`);