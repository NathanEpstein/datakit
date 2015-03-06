var dk = require('./lib/datakit.js')

var floats = [];
for (var i=0; i<10000; i++){
  floats.push(0.1);
  floats.push(0.2);
  floats.push(0.3);
}

var s = 0;
var p = 1;
floats_ = floats.slice(0,5)
floats_.forEach(function(e,i){
  p= p*e
})

var targ = dk.prod(floats_)
console.log(p,dk.prod(floats_))
console.log(dk.isclose(p,dk.prod(floats_)))