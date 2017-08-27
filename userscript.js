// ==UserScript==
// @name         scrimba vim
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://scrimba.com/casts/*
// @grant        none
// ==/UserScript==

(function () {
    function loadScript () {
        let src = document.createElement("script");
        src.src = "http://127.0.0.1:9002/js/socket.js";
        src.async = true;
        document.head.appendChild(src);
        return src;
    }

    let lastScript = undefined;
    scrimba_vim_loaded = false;
    console.log("trying to connect to vim..");

    function reload () {
        if (scrimba_vim_loaded) return;
        if (lastScript !== undefined) {
            document.head.removeChild(lastScript);
        }

        lastScript = loadScript();
        setTimeout(reload, 500);
    }

    reload();
})();
