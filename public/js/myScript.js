$(() => {

    let socket = io();
    let canvas= $('#whiteboard')
    let color = 'black'
    let context = canvas[0].getContext('2d')

    let drawing = false;

    let current = {};

    canvas[0].addEventListener('mousedown', onMouseDown, false);
    canvas[0].addEventListener('mouseup', onMouseUp, false);
    canvas[0].addEventListener('mouseout', onMouseUp, false);
    canvas[0].addEventListener('mousemove', throttle(onMouseMove, 10), false);

    socket.on('drawing', onDrawingEvent);

    window.addEventListener('resize', onResize, false);
    onResize();

    $('#colorpicker').on('change', (event)=>{

        color = event.target.value;

    })
  
  
    function drawLine(x0, y0, x1, y1, color, emit){
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
      context.closePath();
  
      if (!emit) { return; }
      let w = canvas[0].width;
      let h = canvas[0].height;
  
      socket.emit('drawing', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color: color
      });
    }

    window.onbeforeunload = ()=>{
        socket.emit('refresh')
    }
  
    function onMouseDown(e){
      drawing = true;
      current.x = e.clientX;
      current.y = e.clientY;
    }
  
    function onMouseUp(e){
      if (!drawing) { return; }
      drawing = false;
      drawLine(current.x, current.y, e.clientX, e.clientY, color, true);
    }
  
    function onMouseMove(e){
      if (!drawing) { return; }
      drawLine(current.x, current.y, e.clientX, e.clientY, color, true);
      current.x = e.clientX;
      current.y = e.clientY;
    }
    
    // limit the number of events per second
    function throttle(callback, delay) {
      let previousCall = new Date().getTime();
      return function() {
        let time = new Date().getTime();
  
        if ((time - previousCall) >= delay) {
          previousCall = time;
          callback.apply(null, arguments);
        }
      };
    }
  
    function onDrawingEvent(data){
      let w = canvas[0].width;
      let h = canvas[0].height;
      drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    }
  
    // make the canvas fill its parent
    function onResize() {
      canvas[0].width = window.innerWidth;
      canvas[0].height = window.innerHeight;
      socket.emit('reDraw', {id: socket.id})
    }

})