define([], function() {

  return function load(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        callback(JSON.parse(xhr.responseText));
      }
    };
    xhr.open('GET', url, true);
    xhr.send();
  }

});
