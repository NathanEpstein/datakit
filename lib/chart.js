var Chart = function(config) {
  var self = this;

  // initial configuration of size and datasets
  var datasets = [];

  self.config = config || {};
  self.config.height = self.config.height || 500;
  self.config.width = self.config.width || 500;
  self.config.bufferHeight = self.config.height * 0.8;
  self.config.bufferWidth = self.config.width * 0.6;

  // public method to plot by calling all private methods
  this.render = function() {
    buildCanvas();
    buildMapping();
    buildAxes();
    plotDataSets();
    return self;
  };

  // public methods to get and set datasets
  this.datasets = function() {
    return datasets.slice();
  };

  this.addDataSet = function(dataset) {
    datasets.push(dataset);
    return self;
  };

  // private methods
  var buildCanvas = function() {
    self.canvas = d3.select(self.config.selector || 'body')
                  .append('svg')
                  .attr('height', self.config.height)
                  .attr('width', self.config.width);

    self.buffer = self.canvas.append('g');

    var xTranslate = (self.config.width - self.config.bufferWidth) / 2;
    var yTranslate = (self.config.height - self.config.bufferHeight) / 2;

    self.buffer.attr(
      'transform',
      'translate(' + xTranslate + ', ' + yTranslate + ')'
    );
  };

  var buildMapping = function() {
    var xMin = mini(datasets[0].x),
        yMin = mini(datasets[0].y),
        xMax = maxi(datasets[0].x),
        yMax = maxi(datasets[0].y);

    datasets.forEach(function(dataset, index) {
      if (index > 0) {
        xMin = Math.min(mini(dataset.x), xMin);
        yMin = Math.min(mini(dataset.y), yMin);
        xMax = Math.max(maxi(dataset.x), xMax);
        yMax = Math.max(maxi(dataset.y), yMax);
      }
    });

    self.xMap = d3.scale.linear()
               .domain([xMin, xMax])
               .range([0, self.config.bufferWidth]);

    self.yMap = d3.scale.linear()
               .domain([yMax, yMin])
               .range([0, self.config.bufferHeight]);

  };

  var buildAxes = function() {
    var xAxis = d3.svg.axis()
                .scale(self.xMap);

    var yAxis = d3.svg.axis()
                .scale(self.yMap)
                .orient('left');

    self.buffer.append('g')
          .attr('transform','translate(0,' + self.config.bufferHeight + ')')
          .call(xAxis);

    self.buffer.append('g')
          .call(yAxis);

    var xLabel = self.buffer.append('text')
                .attr('x', self.config.bufferWidth * 0.5)
                .attr('y', self.config.bufferHeight + 50)
                .text(self.config.xLab)
                .attr('text-anchor','middle');

    var yLabel = self.buffer.append('text')
                .attr('x', -self.config.bufferHeight * 0.5)
                .attr('y', -50)
                .attr('transform','rotate(-90)')
                .text(self.config.yLab)
                .attr('text-anchor','middle');

  };

  var plotDataSets = function() {
    datasets.forEach(function(dataset) {
      if (dataset.type == 'line') {
        for (var i = 1; i < dataset.x.length; i++) {
          self.buffer.append('line')
              .attr('stroke-width', 1)
              .attr('stroke', 'black')
              .attr('x1', self.xMap(dataset.x[i-1]))
              .attr('x2', self.xMap(dataset.x[i]))
              .attr('y1', self.yMap(dataset.y[i-1]))
              .attr('y2', self.yMap(dataset.y[i]));
        };
      }
      else if (typeof dataset.labels !== 'undefined') {
        for (var i = 0; i < dataset.x.length; i++) {
          self.buffer.append('text')
              .attr('x', self.xMap(dataset.x[i]))
              .attr('y', self.yMap(dataset.y[i]))
              .text(dataset.labels[i])
              .attr('text-anchor','middle')
              .attr('stroke', dataset.color || 'black');
        };
      }
      else {
        // make a scatter plot if not a line
        for (var i = 0; i < dataset.x.length; i++) {
          var zMin = typeof dataset.z === 'undefined' ? null : mini(dataset.z);
          var zMax = typeof dataset.z === 'undefined' ? null : maxi(dataset.z);

          self.buffer.append('circle')
              .attr('r', function() {
                if (typeof dataset.z === 'undefined') {
                  return self.config.height * self.config.width * (0.00002);
                }
                else {
                  var minSize = self.config.height * self.config.width * 0.000025;
                  var sizeMultiplier = self.config.height * self.config.width * (0.0001);
                  var proportionOfMaxValue = (dataset.z[i] - zMin) / (zMax - zMin);

                  return (minSize + sizeMultiplier * proportionOfMaxValue);
                }
              })
              .attr('cx', self.xMap(dataset.x[i]))
              .attr('cy', self.yMap(dataset.y[i]))
              .attr('opacity',function() {
                if (typeof z === 'undefined') {
                  return 1;
                }
                else{
                  return 0.3;
                }
              })
              .attr('fill',function() {
                if (typeof dataset.colors === 'undefined') {
                  return 'none';
                }
                else{
                  return dataset.colors[i];
                }
              })
              .attr('stroke', 'black');
        };
      };
    });
  };

  function mini(arr) {
    return Math.min.apply(null, arr);
  };

  function maxi(arr) {
    return Math.max.apply(null, arr);
  };
};

module.exports = Chart;

