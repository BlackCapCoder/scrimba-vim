// ==UserScript==
// @name         scrimba vim
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://scrimba.com/casts/*
// @grant        none
// ==/UserScript==

var src = document.createElement("script");
src.src = "http://127.0.0.1:9001/js/socket.js";
src.async = true;
document.head.appendChild(src);
