var dk = require('../../lib/datakit.js');

describe('isclose',function(){
  it('should return true for close numbers',function(){
    expect(dk.isclose(0,Math.pow(10,-15))).toBe(true);
  });
  it('should return false for distant numbers',function(){
    expect(dk.isclose(0,Math.pow(10,-5))).toBe(false);
  });
});

describe('sum',function(){
  var top = 10000;
  var nums = [];
  for (var i=0; i<=top; i++){
    nums.push(i);
  }
  it('should accurately sum numbers',function(){
    expect(dk.sum(nums)).toBe((top*(top+1)/2));
  });

  var floats = [0.1,0.2];
  it('should minimize errors in floating point arithmetic',function(){
    expect(dk.isclose(0.3,dk.sum(floats))).toBe(true);
  });
});



