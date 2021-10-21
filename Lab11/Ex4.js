//Exercise 4

function is_string_non_neg_int(q, returnErrors = false) {
    //If returnErrors is true, array of errors is returned
    //others return true if q is a non-neg int.
    errors = []; // assume no errors at first
    if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
    if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer

    return returnErrors ? errors : (errors.length == 0)
};


var attributes  =  "Emily;20;20.5;-19.5";
var parts = attributes.split(';');

for (part of parts) {
    console.log(`${part} isNonNegInt: ${is_string_non_neg_int(part, true)}`);
}

//Exercise 6

function checkIt (item, index){

}
parts.forEach((item,index)=>{    console.log(`part ${index} is ${(is_string_non_neg_int(item)?'a':'not a')} quantity`);});