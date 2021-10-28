var month = 1;
var day = 29;
var year = 2001;

step1 = year - 2000;
step2 = parseInt(step1/4);
step3 = step1 + step2;

//born in January, so skip to step 5 (no need steps 4,6,7)
/*
    step4 = 2;
    step6 = step4 + step3;
    step7 = day + step6;
*/
step5 = step3 + day;

//step 8 is the total from step 5
step8 = 30;

//not a leap year
step9 = step8 - 1;
step10 = step9 % 7;

console.log(step10);
//outputs 1 (Monday)