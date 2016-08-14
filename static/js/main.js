define(['load', 'draw'], function(load, draw) {

  load('github/alecmce/primitivesJS', (response) => {
    if (response.error) {
      console.log(response.error);
    } else {
      draw(response.data);
    }
  });

});
