define(['colors'], function(colors) {

  var width = window.innerWidth;
  var height = window.innerHeight;
  var padding = 10;
  var spacing = 10;

  var canvas = document.getElementById('canvas');
  canvas.width = width;
  canvas.height = height;

  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'green';

  function getMaxLineLength(data) {
    return Math.max(...data.map((data) => Math.max(...data.data)));
  }

  return function draw(data) {
    var x = padding;
    var y = padding;
    var max = getMaxLineLength(data);

    data.sort((a, b) => b.data.length - a.data.length);

    data.forEach((data, index) => {
      var lines = data.data;

      if (x + lines.length > width - padding) {
        y += max + spacing;
        x = padding;
      }

      ctx.fillStyle = colors[index % colors.length];
      lines.forEach((line, i) => {
        ctx.fillRect(x + i, y + max - line, 1, line);
      });

      x += lines.length + spacing;
    });
  };
});
