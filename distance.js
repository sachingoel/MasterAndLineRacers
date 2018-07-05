let lo = require("lodash");
 function distancesum(arr, n){
     
    arr.sort(function(a,b){
      return a-b
    });
     
    res = 0
    sum = 0
    for(let i in arr){
        res += (arr[i] * i - sum)
        sum += arr[i]
    }
     
    return res
 }
     
function totaldistancesum( x , y , n ){
    return distancesum(x, n) + distancesum(y, n)
}
     

let x = [30,40,77]
let y = [39, 50, 81]
let n = x.length;

// console.log("lodash sorting is======",lo.sortBy(x));

// let zz = [ { x2: 39, y2: 77, split: 10 },
//   { x3: 53, y3: 3, split: 10 },
//   { x1: 109, y1: 24, split: 10 } ]

// let cc= lo.findIndex(zz[0], (item)=>{
//   console.log("item is======",item);
//   // return item.indexOf("x") !== -1;
// })
// console.log("cc value is =====>",cc);


console.log("maximum distance is ==========>>>>>>>",totaldistancesum(x, y, n) );
 
