var dk = require('../../lib/datakit.js');

describe('isclose',function(){
  it('should return true for close numbers',function(){
    expect(dk.isclose(0,Math.pow(10,-15))).toBe(true);
  });
  it('should return false for distant numbers',function(){
    expect(dk.isclose(0,Math.pow(10,-5))).toBe(false);
  });
});

var floats = [];
for (var i=0; i<10000; i++){
  floats.push(0.1);
  floats.push(0.2);
  floats.push(0.3);
}

describe('sum',function(){
  var top = 10000;
  var nums = [];
  for (var i=0; i<=top; i++){
    nums.push(i);
  }
  it('should accurately sum numbers',function(){
    expect(dk.sum(nums)).toBe((top*(top+1)/2));
  });

  it('should minimize errors in floating point arithmetic',function(){
    expect(dk.isclose(6000,dk.sum(floats))).toBe(true);
  });
});

describe('mean',function(){
  var nums = [-10,15,25,0,-5];
  it('should accurately compute the mean of numbers',function(){
    expect(dk.mean(nums)).toBe(5);
  });

  it('should minimize errors in floating point arithmetic',function(){
    expect(dk.isclose(0.2,dk.mean(floats))).toBe(true);
  });
});

describe('prod',function(){
  var top = 10;
  var nums = [];
  for (var i=1; i<=top; i++){
    nums.push(i);
  }
  it('should accurately compute a product of numbers',function(){
    expect(dk.prod(nums)).toBe(3628800);
  });

  var floats_ = [Math.pow(10,75)].concat(floats.slice(0,99));
  it('should minimize errors in floating point arithmetic',function(){
    expect(dk.isclose(dk.prod(floats_),47.751966659678405306351616)).toBe(true);
  });
});






