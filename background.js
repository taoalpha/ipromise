chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    'minWidth': 320,
    'minHeight': 568,
    'bounds': {
      'width': 320,
      'height': 568
    }
  });
});
