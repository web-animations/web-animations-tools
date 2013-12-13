Polymer('wat-bezier', {
  xy: [0, 0, 1, 1], // [P1x, P1y, P2x, P2y]
  target: new Animation(null, null, 0),
  movingP1: false,
  movingP2: false,
  preset: 'custom',
  
  easing: {
    'linear': [0, 0, 1, 1],
    'ease': [0.25, 0.1, 0.25, 1],
    'ease-in': [0.42, 0, 1, 1],
    'ease-out': [0, 0, 0.58, 1],
    'ease-in-out': [0.42, 0, 0.58, 1],
  },
     
  observe: {
    xy: 'updateTimingFunction',
    preset: 'presetEasing',
    target: 'updateEasing',
    'target.specified.easing': 'updateControlPoints',
  },
  
  ready: function() {
    var canvas = this.$.canvas;
    var context = canvas.getContext('2d');

    context.scale(canvas.width, -0.5 * canvas.height);
    context.translate(0, -1.5);
    this.drawControlHandles(context);
    this.drawTimingFunction(context);
  },
  
 drawTimingFunction: function(context) {
    context.beginPath();
    context.moveTo(0, 0);
    context.bezierCurveTo(this.xy[0], this.xy[1], this.xy[2], this.xy[3], 1, 1);
    context.fillStyle = 'rgba(0,0,0,.6)';
    context.lineWidth = 0.02;
    context.strokeStyle = 'black';
    context.stroke();
    context.closePath();
  },
  
  stringToCoords: function(str) {
    if (str.indexOf('cubic-bezier(') != -1) {
      return str.substring(
          str.indexOf('(')+1, str.indexOf(')')).split(',').map(Number);  
    } else {
      return this.easing[str];
    }
  },
  
  coordsToString: function(coords) {
    for (var t in this.easing) {
      if (this.easing[t].toString() == coords.toString()) {
        return t;  
      }
    }
    return 'cubic-bezier(' + coords[0] + ',' + coords[1] + ',' + coords[2] + 
        ',' + coords[3] + ')';
  },
  
  drawControlHandles: function(context) {
    var width = this.$.canvas.width;
    var height = this.$.canvas.height;
    
    context.fillStyle = 'rgba(0,0,0,.4)';
    context.lineWidth = 0.01;

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(this.xy[0], this.xy[1]);
    this.$.P1.style.left = this.xy[0] * width + 'px';
    this.$.P1.style.top = (this.xy[1] - 1.5) * height * -0.5 + 'px';
    if (this.xy[1] < -0.5 || this.xy[1] > 1.5) {
      this.$.P1.style.visibility = 'hidden';
    } else {
      this.$.P1.style.visibility = 'inherit';
    }
    context.strokeStyle = 'rgba(133,66,244,1)';
    context.stroke();
    context.closePath();
    
    context.beginPath();
    context.moveTo(1, 1);
    context.lineTo(this.xy[2], this.xy[3]);
    this.$.P2.style.left = this.xy[2] * width + 'px';
    this.$.P2.style.top = (this.xy[3] - 1.5) * height * -0.5 + 'px';
    if (this.xy[3] < -0.5 || this.xy[3] > 1.5) {
      this.$.P2.style.visibility = 'hidden';
    } else {
      this.$.P2.style.visibility = 'inherit';
    }
    context.strokeStyle = 'rgba(0,170,187,1)';
    context.stroke();
    context.closePath();
  },
  
  updateTimingFunction: function() {
    this.updateCanvas();
    this.updateEasing();
  },
  
  updateCanvas: function() {
    var canvas = this.$.canvas;
    var context = canvas.getContext('2d');

    context.clearRect(0, -1.5, canvas.width, canvas.height);
    this.drawControlHandles(context);
    this.drawTimingFunction(context);
  },
  
  updateEasing: function() {
    if (this.target && this.target.specified) {
      this.target.specified.easing = 
          this.coordsToString(this.xy);
    }
  },
  
  updateControlPoints: function() {
    this.$.P1.visibility = 'hidden';
    this.xy = this.stringToCoords(this.target.specified.easing).slice();
  },
    
  presetEasing: function() {   
    if (this.preset == 'custom') {
      this.$.P1x.disabled = this.$.P1y.disabled = this.$.P2x.disabled 
          = this.$.P2y.disabled = false;
    } else {
      this.xy = this.easing[this.preset].slice();
      this.$.P1x.disabled = this.$.P1y.disabled = this.$.P2x.disabled 
          = this.$.P2y.disabled = true;      
    }
  },
  
  moveP1: function() {
    var boundingBox = this.$.canvas.getBoundingClientRect();       

    this.preset = 'custom';
    
    this.onmousemove = function drag(e) {
      var x = (e.pageX - boundingBox.left) / boundingBox.width;
      var y = 1.5 - 2 * (e.pageY - boundingBox.top) / boundingBox.height;
      
      this.movingP1 = true;
      this.xy[0] = Math.max(Math.min(x.toFixed(2), 1), 0);
      this.xy[1] = parseFloat(y.toFixed(2));
    };
    
    this.onmouseup = function() {
      this.movingP1 = false;
      this.$.P1.blur();
      this.onmousemove = this.onmouseup = null;
    }
  },
  
  moveP2: function() {
    var boundingBox = this.$.canvas.getBoundingClientRect();      

    this.preset = 'custom';

    this.onmousemove = function drag(e) {
      var x = (e.pageX - boundingBox.left) / boundingBox.width;
      var y = 1.5 - 2 * (e.pageY - boundingBox.top) / boundingBox.height;
      
      this.movingP2 = true;
      this.xy[2] = Math.max(Math.min(x.toFixed(2), 1), 0);
      this.xy[3] = parseFloat(y.toFixed(2));
    };
    
    this.onmouseup = function() {
      this.movingP2 = false;
      this.$.P2.blur();
      this.onmousemove = this.onmouseup = null;
    }
  },
  
  selectPoint: function(e) {
    var distance = function(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };
    var boundingBox = this.$.canvas.getBoundingClientRect();
    var x = (e.pageX - boundingBox.left) / boundingBox.width;
    var y = 1.5 - 2 * (e.pageY - boundingBox.top) / boundingBox.height;
    
    var distP1 = distance(x, y, this.xy[0], this.xy[1]);
    var distP2 = distance(x, y, this.xy[2], this.xy[3]);
    
    if (distP1 <= distP2) {
      this.xy[0] = Math.max(Math.min(x.toFixed(2), 1), 0);
      this.xy[1] = parseFloat(y.toFixed(2));
    } else {
      this.xy[2] = Math.max(Math.min(x.toFixed(2), 1), 0);
      this.xy[3] = parseFloat(y.toFixed(2));   
    }
    
    this.preset = 'custom';
  }
});

