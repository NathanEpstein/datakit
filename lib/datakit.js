'use strict'
var fs = require('fs');

// SUMMARY STATISTICS/CONVENIENCE METHODS

//check if args are close (implementation from numpy)
var isclose = module.exports.isclose = function(a,b){
  var atol = Math.pow(10,-8);
  var rtol = Math.pow(10,-5);
  return (Math.abs(a-b) <= (atol + rtol*Math.abs(b)));
}
//array sum (Kahan summation algorithm)
var sum = module.exports.sum = function(arr){
  var s = 0;
  var c = 0;
  for (var i=0;i<arr.length;i++){
    var y = arr[i] - c;
    var t = s + y;
    c = (t - s) - y;
    s = t;
  }
  return s;
}

// from 'Accurate Floating Point Product' - Stef Graillat
// EF split of float into 2 parts
var split = function(val){
  var factor = Math.pow(2,27)+1;
  var c = factor * val;
  var x = c - (c - val);
  var y = val - x;
  return [x,y];
}
// EFT of the product of 2 floats
var twoProd = function(a,b){
  var x = a * b;
  var A = split(a);
  var B = split(b);
  var y = A[1] * B[1] - (((x - A[0] * B[0]) - A[1] * B[0]) - A[0] * B[1]);
  return [x,y];
}
//array product (compensated product method)
var prod = module.exports.prod = function(arr){
  var p_ = arr[0];
  var e_ = 0;
  for (var i=1; i<arr.length;i++){
    var step = twoProd(p_,arr[i]);
    p_ = step[0];
    e_ = e_ * arr[i] + step[1];
  }
  return (p_ + e_);
}
//array mean
var mean = module.exports.mean = function(arr){
  return prod([sum(arr),1 / arr.length]);
}
//array max and min
var min = module.exports.min = function(arr){
  return Math.min.apply(null,arr);
}
var max = module.exports.max = function(arr){
  return Math.max.apply(null,arr);
}
//mean shifted covariance to stabilize against catastrophic cancellation
var cov = module.exports.cov = function(arr1,arr2){
  var n = arr1.length;
  if (n < 2) return 0;
  var m1 = mean(arr1),
      m2 = mean(arr2),
      res = 0;

  for (var i=0; i<arr1.length;i++){
    var a = (arr1[i] - m1);
    var b = (arr2[i] - m2);
    res += a*b/(n-1) ;
  }
  return res;
}
//std deviation and variance
var vari = module.exports.vari = function(arr){
  return cov(arr,arr);
}
var sd = module.exports.sd = function(arr){
  return Math.sqrt(cov(arr,arr));
}

//READ AND MANIPULATE DATA

//read csv
var csv = module.exports.csv = function(path,callback){
  fs.readFile(path,function(err,data){
    var reg = new RegExp('\r','g');
    var parse = String(data)
      .replace(reg,'')
      .split('\n');

    var colnames = parse[0].split(',');

    var res = [];
    for (var i=1; i<parse.length;i++){
      var rowObj = {};
      parse[i].split(',').forEach(function(el,j){
        rowObj[colnames[j]] = el;
      });
      res.push(rowObj);
    }
    callback(res);
  });
}

//Given an array of objects (arr), get all values associated with a key (key).
var col = module.exports.col = function(arr,key){
  var res = [];
  arr.forEach(function(row){
    res.push(row[key]);
  });
  return res;
}

//RANDOM NUMBERS

//array of uniform random variables
var uni = module.exports.uni = function(n){
  var res = [];
  for (var i=0; i<n; i++){
    res.push(Math.random());
  }
  return res;
}

var norm = module.exports.norm = function(n,mu,sig){
  mu = mu || 0;
  sig = sig || 1;

  //makes a pair of normals with specified parameters via Box-Muller
  function box(mu_,sig_){
    var u1 = Math.random();
    var u2 = Math.random();
    var z1 = Math.sqrt(-2*Math.log(u1))*Math.cos(2*u2*Math.PI);
    var z2 = Math.sqrt(-2*Math.log(u1))*Math.sin(2*u2*Math.PI);
    return [(mu_+(sig_*z1)),(mu_+(sig_*z2))];
  }
  var res = [];
  if (n % 2 == 0){
    var iter = n/2;
  }
  else{
    var iter = (n-1)/2;
    res.push(box(mu,sig).pop());
  }
  for (var i=0; i<iter;i++){
    res = res.concat(box(mu,sig));
  }
  return res;
}

// additions
// seq and rep
// replace col with sql style select
// plotting
