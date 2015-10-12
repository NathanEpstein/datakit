'use strict'
var fs = require('fs');
var exec = require('child_process').exec;
var express = require('express');

// SUMMARY STATISTICS/CONVENIENCE METHODS

//check if args are close (implementation from numpy)
var isclose = module.exports.isclose = function(a, b) {
  var atol = Math.pow(10, -8);
  var rtol = Math.pow(10, -5);
  return (Math.abs(a - b) <= (atol + rtol * Math.abs(b)));
};
//array sum (Kahan summation algorithm)
var sum = module.exports.sum = function(arr) {
  var s = 0;
  var c = 0;
  for (var i = 0; i < arr.length; i++) {
    var y = arr[i] - c;
    var t = s + y;
    c = (t - s) - y;
    s = t;
  }
  return s;
};

// from 'Accurate Floating Point Product' - Stef Graillat
// EF split of float into 2 parts
var split = function(val) {
  var factor = Math.pow(2, 27) + 1;
  var c = factor * val;
  var x = c - (c - val);
  var y = val - x;
  return [x, y];
};
// EFT of the product of 2 floats
var twoProd = function(a, b) {
  var x = a * b;
  var A = split(a);
  var B = split(b);
  var y = A[1] * B[1] - (((x - A[0] * B[0]) - A[1] * B[0]) - A[0] * B[1]);
  return [x, y];
};
//array product (compensated product method)
var prod = module.exports.prod = function(arr) {
  var p_ = arr[0];
  var e_ = 0;
  for (var i = 1; i < arr.length; i++) {
    var step = twoProd(p_, arr[i]);
    p_ = step[0];
    e_ = e_ * arr[i] + step[1];
  }
  return (p_ + e_);
};
//array mean
var mean = module.exports.mean = function(arr) {
  return prod([sum(arr), 1 / arr.length]);
};
//array max and min
var min = module.exports.min = function(arr) {
  return Math.min.apply(null, arr);
};
var max = module.exports.max = function(arr) {
  return Math.max.apply(null, arr);
};
//mean shifted covariance to stabilize against catastrophic cancellation
var cov = module.exports.cov = function(arr1, arr2) {
  var n = arr1.length;
  if (n < 2) return 0;
  var m1 = mean(arr1),
      m2 = mean(arr2),
      res = 0;

  for (var i = 0; i < arr1.length; i++) {
    var a = (arr1[i] - m1),
        b = (arr2[i] - m2);
    res += a * b / (n - 1);
  }
  return res;
};
//std deviation and variance
var vari = module.exports.vari = function(arr) {
  return cov(arr, arr);
};
var sd = module.exports.sd = function(arr) {
  return Math.sqrt(cov(arr, arr));
};

//READ AND MANIPULATE DATA

//read csv
var csv = module.exports.csv = function(path, callback) {
  fs.readFile(path,function(err, data) {
    var reg = new RegExp('\r', 'g');
    var parse = String(data)
      .replace(reg, '')
      .split('\n');

    var colnames = parse[0].split(',');

    var res = [];
    for (var i = 1; i < parse.length; i++) {
      var rowObj = {};
      parse[i].split(',').forEach(function(el, j) {
        rowObj[colnames[j]] = el;
      });
      res.push(rowObj);
    }
    callback(res);
  });
};

//Given an array of objects (arr), get all values associated with a key (key).
var col = module.exports.col = function(arr, key) {
  var res = [];
  arr.forEach(function(row) {
    res.push(row[key]);
  });
  return res;
};

// Assumes headings is an array of headings. Would be nice if it could also be an
// array of column numbers.
var numeric = module.exports.numeric = function(data, headings, replaceBlanks) {
  var heads = Array.prototype.slice.call(arguments, 1, 2)[0];
  if (heads.length === 0 || heads === undefined) {
    throw new Error('No headings supplied to numeric.');
  }

  var includeNaN = false;

  for (var i = 0; i < heads.length; i++) {
    var head = heads[i];
    for (var j = 0; j < data.length; j++) {
      if (data[j][head] === '') {
        data[j][head] = replaceBlanks || 0;
      }
      else {
        data[j][head] = Number(data[j][head]);
      }
    if (isNaN(data[j][head])) includeNaN = true;
    };
  };

  if (includeNaN === true) console.log("Warning: Some values are NaN.");

  return data;
};

//RANDOM NUMBERS

//array of exponential random variables
var exp = module.exports.exp = function(n, lambda) {
  lambda = lambda || 1;
  var res = [];
  for (var i = 0; i < n; i++) {
    var U = Math.random();
    res.push(-Math.log(U) / lambda);
  }
  return res;
};

//array of uniform random variables
var uni = module.exports.uni = function(n) {
  var res = [];
  for (var i = 0; i < n; i++) {
    res.push(Math.random());
  }
  return res;
};

var norm = module.exports.norm = function(n, mu, sig) {
  mu = mu || 0;
  sig = sig || 1;

  //makes a pair of normals with specified parameters via Box-Muller
  function box(mu_, sig_) {
    var u1 = Math.random();
    var u2 = Math.random();
    var z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * u2 * Math.PI);
    var z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * u2 * Math.PI);
    return [(mu_ + (sig_ * z1)), (mu_ + (sig_ * z2))];
  };
  var res = [];
  if (n % 2 == 0) {
    var iter = n / 2;
  }
  else {
    var iter = (n - 1) / 2;
    res.push(box(mu, sig).pop());
  }
  for (var i = 0; i < iter; i++) {
    res = res.concat(box(mu, sig));
  }
  return res;
};

//SEQUENCE METHOD
var seq = module.exports.seq = function(start, end, incr) {
  var res = [];
  var num = start;
  incr = incr || 1;

  while (num <= end) {
    res.push(num);
    num += incr;
  }
  return res;
};

// LINEAR REGRESSION
var reg = module.exports.reg = function(x, y) {
  // infer the regression line
  var beta = cov(x, y) / vari(x);
  var alpha = mean(y) - (beta * mean(x));

  var res = {};
  res.f = function(input) {
    return (alpha + (beta * input));
  };

  // set array of estimated y values for each x
  res.pts = [];
  x.forEach(function(point, i) {
    res.pts.push(res.f(point));
  });

  // set endpoints
  var xMin = min(x);
  var xMax = max(x);
  res.endPoints = {
    x1: xMin,
    x2: xMax,
    y1: res.f(xMin),
    y2: res.f(xMax)
  }

  return res;
};

//REPEATED VALUES
var rep = module.exports.rep = function(val, n) {
  var res = [];
  for (var i = 0; i < n; i++) {
    res.push(val);
  }
  return res;
};


//PLOTTING
var server, html;
var app = express();
app.get('/', function(req, res) {
  res.send(html);
});

var Chart = module.exports.Chart = require('./chart.js');

Chart.prototype.plot = function() {
  var self = this;
  var head = '<head>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js" charset="utf-8"></script>\n<style>\nsvg path, svg line{\n  fill:none;\n  stroke:black;\n}\nsvg text {\n  font-family: sans-serif;\n  font-size: 11px;\n}\n</style>\n<script type="text/javascript">\n var Chart = '+ Chart + '\n</script>\n</head>\n'

  var body = '<body>\n<script type="text/javascript">\n var chart = new Chart(' + JSON.stringify(self.config) + ');\n chart'

  var dataStrings = '';

  self.datasets().forEach(function(dataset) {
    dataStrings += '.addDataSet(' + JSON.stringify(dataset) + ')';
  });

  var tail = '.render();\n</script>\n</body>'

  html = head + body + dataStrings + tail;
  if (typeof server === 'undefined') server = app.listen(2000);
  exec('open http://localhost:2000/');
  return html;
};
