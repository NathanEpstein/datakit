//check if args are close (implementation from numpy)
var isclose = function(a,b){
  var atol = Math.pow(10,-8);
  var rtol = Math.pow(10,-5);
  return (Math.abs(a-b) <= (atol + rtol*Math.abs(b)));
}

//array sum (Kahan summation algorithm)
var sum = function(arr){
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
var prod = function(arr){
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
var mean = function(arr){
  return prod([sum(arr),1 / arr.length]);
}
//array max and min
var min = function(arr){
  return Math.max.apply(null,arr);
}
var max = function(){
  return Math.max.apply(null,arr);
}
//array standard deviation, computed with shift of sample mean for max stability (not yet complete)
var sd = function(arr){
  var k = mean(arr);
  var s = 0;
  var s_sq = 0;
  for (var i=0; i<arr.length;i++){
    s += arr[i] - k;
    s_sq += Math.pow(arr[i] - k, 2);
  }
  // return prod([s_sq,1/arr.length]) - Math.pow(prod([s,1/arr.length]),2);
}
//potential additions
// cor, csv, column, order stats, rnorm, runif, binom
// plotting

