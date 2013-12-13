Polymer('wat-bezier', {
  P1x: 0,
  P1y: 0,
  P2x: 1,
  P2y: 1,
  target: new Animation(null, null, 0),
  movingP1: false,
  movingP2: false,
  preset: 'custom',
     
  observe: {
    P1x: 'updateTimingFunction',
    P1y: 'updateTimingFunction',
    P2x: 'updateTimingFunction',
    P2y: 'updateTimingFunction',
    preset: 'presetEasing',
    target: 'updateEasing',
  },
  
  ready: function() {
    var canvas = this.$.canvas;
    var context = canvas.getContext('2d');

    context.scale(canvas.width, -0.5 * canvas.height);
    context.translate(0, -1.5);
    this.drawControlHandles(context);
    this.drawTimingFunction(context);
    this.updateEasing();
  },
  
 drawTimingFunction: function(context) {
    context.beginPath();
    context.moveTo(0, 0);
    context.bezierCurveTo(this.P1x, this.P1y, this.P2x, this.P2y, 1, 1);
    context.fillStyle = 'rgba(0,0,0,.6)';
    context.lineWidth = 0.02;
    context.strokeStyle = 'black';
    context.stroke();
    context.closePath();
  },
  
  drawControlHandles: function(context) {
    var width = this.$.canvas.width;
    var height = this.$.canvas.height;
    
    context.fillStyle = 'rgba(0,0,0,.4)';
    context.lineWidth = 0.01;

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(this.P1x, this.P1y);
    this.$.P1.style.left = this.P1x * width + 'px';
    this.$.P1.style.top = (this.P1y - 1.5) * height * -0.5 + 'px';
    if (this.P1y < -0.5 || this.P1y > 1.5) {
      this.$.P1.style.visibility = 'hidden';
    } else {
      this.$.P1.style.visibility = 'inherit';
    }
    context.strokeStyle = 'rgba(133,66,244,1)';
    context.stroke();
    context.closePath();
    
    context.beginPath();
    context.moveTo(1, 1);
    context.lineTo(this.P2x, this.P2y);
    this.$.P2.style.left = this.P2x * width + 'px';
    this.$.P2.style.top = (this.P2y - 1.5) * height * -0.5 + 'px';
    if (this.P2y < -0.5 || this.P2y > 1.5) {
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
      if (this.preset == 'custom') {
        this.target.specified.easing = 'cubic-bezier(' + this.P1x + ', ' +
            this.P1y + ', ' + this.P2x + ', ' + this.P2y + ')';
      } else {
        this.target.specified.easing = this.preset;
      }
    }
  },
    
  presetEasing: function() {
    var preset = this.$.preset;
    
    switch (this.preset) {
      case 'custom':
        this.$.P1x.disabled = this.$.P1y.disabled = this.$.P2x.disabled 
           = this.$.P2y.disabled = false;
        break;
      case 'linear':
        this.P1x = this.P1y = 0;
        this.P2x = this.P2y = 1;
        break;
      case 'ease':
        this.P1x = this.P2x = 0.25;
        this.P1y = 0.1
        this.P2y = 1;
        break;
      case 'ease-in':
        this.P1x = 0.4;
        this.P1y = 0;
        this.P2x = this.P2y = 1;
        break;
      case 'ease-out':
        this.P1x = this.P1y = 0;
        this.P2x = 0.58;
        this.P2y = 1;
        break;
      case 'ease-in-out':
        this.P1x = 0.42;
        this.P1y = 0;
        this.P2x = 0.58;
        this.P2y = 1;
        break;
    }
    if (this.preset != 'custom') {
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
      this.P1x = Math.max(Math.min(x.toFixed(2), 1), 0);
      this.P1y = y.toFixed(2);
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
      this.P2x = Math.max(Math.min(x.toFixed(2), 1), 0);
      this.P2y = y.toFixed(2);
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
    
    // determine which point is closer to (x, y)
    var distP1 = distance(x, y, this.P1x, this.P1y);
    var distP2 = distance(x, y, this.P2x, this.P2y);
    
    if (distP1 <= distP2) {
      this.P1x = Math.max(Math.min(x.toFixed(2), 1), 0);
      this.P1y = y.toFixed(2);
    } else {
      this.P2x = Math.max(Math.min(x.toFixed(2), 1), 0);
      this.P2y = y.toFixed(2);        
    }
  }
});

