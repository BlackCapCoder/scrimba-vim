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
    // console.log(a.length)
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

  replaceText = function replaceText (oldCols, oldLines, newCols, newLines, fileIndex, text,sc=1,sl=1) {
    let lst = [ 250,147,fileIndex,145,146
              , 148  // multiple lines
              , sc, sl // from beginning of file
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

  writeText = function writeText (txt, doInit=false, line=1, col=1, file=1) {
    var lst = [];

    if (doInit) {
      lst = [ 252, 148, file, line, col
            , 161, txt.charCodeAt(0)
            // , 248, 146, 32, 2
            ];
    }

    for (let i = doInit? 1:0; i < txt.length; i++) {
      let chr = txt.charCodeAt(i);

      if (chr == 10) {
        lst.push(149);
        lst.push(file);
        lst.push(line);
        lst.push(col+1);
        line++; col = 0;
      }

      lst.push(161);
      lst.push(chr);
      col++;

      if (chr == 10) {
        lst.push(146);
        lst.push(line);
        lst.push(col);
      }
    }

    pushBuff(lst);
  }

  setCur = function setCur (col, line, file=1) {
    pushBuff([249, 147, file, line, col]);
  }

  // I can't be bothered
  __replace = function __replace(text,file=1) {
    let pack = text.substring(0,255);
    let olc = countLineCol(SE.getValue());
    let nlc = countLineCol(pack);
    replaceText(olc.cols, olc.lines, nlc.cols+1, nlc.lines, file, pack);
    text = text.slice(255);
    // let flc = countLineCol(pack+text);
    if (text.length > 0) {
      writeText(text, true, nlc.lines, nlc.cols+1, lastFile);
    }
  }

  lastFile = 1;
  setFile = function setFile (ix) {
    lastFile = ix;
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
        // SE.setPosition(lastCur);
        setCur(lastCur.column, lastCur.lineNumber, lastFile);
        break;
      case "fileChanged":
        if (data == "index.html") setFile (1);
        if (data == "index.css")  setFile (2);
        if (data == "index.js")   setFile (3);
        break;
      case "index.html":
        __replace(data,1); // SE.setValue(data);
        setCur(lastCur.column, lastCur.lineNumber, 1); // SE.setPosition(lastCur);
        lastFile = 1;
        break;
      case "index.css":
        __replace(data,2);
        setCur(lastCur.column, lastCur.lineNumber, 2);
        lastFile = 2;
        break;
      case "index.js":
        __replace(data,3);
        setCur(lastCur.column, lastCur.lineNumber, 3);
        lastFile = 3;
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

