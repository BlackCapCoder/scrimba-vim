/* Injected into the webpage we're linking to 
 * I recommend using GreaseMonkey or something similar to automatically inject,
 * but you can also just do something like:
 * <script src='http://127.0.0.1:9001/js/socket.js'></script>
 */

(function () {
  console.log("Hello from scrimba-vim");

  function merge (a, b) {
    var l = a.length + b.length;
    var q = new Uint8Array(l);
    console.log(a.length)
    q.set(a,0);
    q.set(b, a.length);
    return q;
  }
  mrg = merge;

  pushBuff = function pushBuff (k) {
    let bu = STR.buffer()._buffer;
    STR.buffer()._buffer = merge(bu, k);
  }

  selectAll = function selectAll (cols, lines) {
    if (lines == 1 && false) {
      pushBuff ([249, 148, 1, 1, 1, cols]);
    } else {
      pushBuff ([249, 149, 1, 1, 1, cols, lines-1]);
    }
  }

  replaceText = function replaceText (oldCols, oldLines, newCols, newLines, fileIndex, text) {
    let lst = [ 250,147,fileIndex,145,146
              , 148  // multiple lines
              , 1, 1 // from beginning of file
              , oldCols
              , oldLines-1
              ];

    let l = text.length;
    if (l < 32) {
      lst.push(160 + text.length);
    } else if (l < 256) {
      lst.push(217);
      lst.push(text.length);
    } else {
      lst.push(218);
      lst.push(Math.ceil(l / 256));
      lst.push(l % 256)
    }

    // Write payload
    for (let i = 0; i < text.length; i++)
      lst.push(text.charCodeAt(i));

    lst.push(146);
    if (l > 255) {
      lst.push(1);
      lst.push(205);
    }
    lst.push(newLines);
    lst.push(newCols);

    pushBuff(lst);
  }

  function countLineCol (txt) {
    let lns = txt.split('\n');
    return {lines: lns.length, cols: lns[lns.length-1].length};
  }

  _replace = function _replace(text, file=1) {
    let olc = countLineCol(SE.getValue());
    let nlc = countLineCol(text);
    replaceText(olc.cols, olc.lines, nlc.cols+1, nlc.lines, file, text);
  }

  setFile = function setFile (ix) {
    pushBuff([255, 147, 251, 4, ix, 147, 251, 5, ix]);
  }




  // ================ Mostly copied from browser-link vim: ===============

  // Change port/address if needed 
  var socket = new WebSocket("ws://127.0.0.1:9001/");

  // Function to handle visible/non-visible. From http://stackoverflow.com/a/19519701
  var visible = (function(){
    // Determine the state and event keys.
    var stateKey, eventKey, keys = {
      hidden: "visibilitychange",
      webkitHidden: "webkitvisibilitychange",
      mozHidden: "mozvisibilitychange",
      msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
      if (stateKey in document) {
        eventKey = keys[stateKey];
        break;
      }
    }

    // Build the function using this key.
    vis = function(cb) {
      // If one is given, register a callback.
      if (cb) {
        document.addEventListener(eventKey, function() {
          cb(vis()); 
        });
      }

      // Return the current state.
      return !document[stateKey];
    }
    return vis;
  })();

  // Listen for window visible and non-visible.
  var pendingReload = false;
  visible(function(vis) {
    if (vis && pendingReload) {
      window.location.reload();
      pendingReload = false;
    }
  });

  var lastCur = {column: 0, lineNumber: 0};

  socket.onopen = function(evt) {  };
  socket.onclose = function(evt) {  };
  socket.onmessage = function(evt) { 
    console.log(evt.data);
    let ix   = evt.data.indexOf(':');
    let type = evt.data.substring(0, ix);
    let data = evt.data.substring(ix+1);

    switch (type) {
      case "cursor":
        let pieces = data.split(':');
        lastCur.lineNumber = Number(pieces[0])
        lastCur.column     = Number(pieces[1])
        SE.setPosition(lastCur);
        break;
      case "fileChanged":
        if (data == "index.html") setFile (1);
        if (data == "index.css") setFile (2);
        if (data == "index.js") setFile (3);
        break;
      case "index.html":
        // SE.setValue(data);
        _replace(data,1);
        SE.setPosition(lastCur);
        break;
      case "index.css":
        _replace(data,2);
        SE.setPosition(lastCur);
        break;
      case "index.js":
        _replace(data,3);
        SE.setPosition(lastCur);
        break;
      default:
        break;
    }
  };
  socket.onerror = function(evt) { console.log(evt); };

  var reloadCSS = function () {
    var elements = document.getElementsByTagName("link");

    var c = 0;

    for (var i = 0; i < elements.length; i++) {
      if (elements[c].rel == "stylesheet") {
        var href = elements[i].getAttribute("data-href");

        if (href == null) {
          href = elements[c].href;
          elements[c].setAttribute("data-href", href);
        }

        if (window.__BL_OVERRIDE_CACHE) {
          var link = document.createElement("link");
          link.href = href;
          link.rel = "stylesheet";
          document.head.appendChild(link);

          document.head.removeChild(elements[c]);

          continue;
        }
        elements[i].href = href + ((href.indexOf("?") == -1) ? "?" : "&") + "c=" + (new Date).getTime();
      }
      c++;
    }
  }

  // if (!window.__BL_NO_CONSOLE_OVERRIDE) {
  //   var log = console.log;
  //   console.log = function(str) {
  //     log.call(console, str);
  //     var err = (new Error).stack;
  //     err = err.replace("Error", "").replace(/\s+at\s/g, '@').replace(/@/g, "\n@");
  //     socket.send(JSON.stringify({
  //       "type"       : "log",
  //       "message"    : str,
  //       "stacktrace" : err
  //     }));
  //   }
  // }

  window.onerror = function(msg, url, lineNumber) {
    socket.send(JSON.stringify({
      "type"       : "error",
      "message"    : msg,
      "url"        : url,
      "lineNumber" : lineNumber
    }));
    return false;
  }
})();

