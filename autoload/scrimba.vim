let s:path = expand('<sfile>:p:h:h')

python <<NOMAS
import sys
import time
import urllib2
import vim
import os
import subprocess
NOMAS

function! scimba#EvaluateSelection()
  call scimba#evaluateJS(scimba#get_visual_selection())
endfunction

function! scimba#EvaluateBuffer()
  call scimba#evaluateJS(join(getline(1,'$')," "))
endfunction

function! scimba#EvaluateWord()
  call scimba#evaluateJS(expand("<cword>") . "()")
endfunction

function! scimba#evaluateJS(js)
  python urllib2.urlopen(urllib2.Request(vim.eval("g:bl_serverpath") + "/evaluate", vim.eval("a:js")))
endfunction

function! scimba#sendCommand(command)
  python <<EOF
try:
  urllib2.urlopen(vim.eval("g:bl_serverpath") + "/" + vim.eval("a:command")).read()
except:
  vim.command("call scimba#startscimba()")
EOF
endfunction

function! scimba#startscimba()
  if has("win32")
    execute 'cd' fnameescape(s:path . "/scimba")
    call system("./start.bat")
    execute 'cd -'
  else
    execute 'cd' fnameescape(s:path . "/scimba")
    call system("node scimba.js &")
    execute 'cd -'
  endif
endfunction

function! scimba#getConsole()
  normal ggdG
python <<EOF
data = urllib2.urlopen(vim.eval("g:bl_serverpath") + "/console").read()
for line in data.split("\n"):
  vim.current.buffer.append(line)
EOF
  setlocal nomodified
  nnoremap <buffer> i :BLEval
  nnoremap <buffer> cc :BLConsoleClear<cr>:e<cr>
  nnoremap <buffer> r :e!<cr>
  nnoremap <buffer> <cr> :BLTraceLine<cr>
endfunction

function! scimba#url2path(url)
  let path = a:url
  " strip off any fragment identifiers
  let hashIdx = stridx(a:url, '#')
  if hashIdx > -1
    let path = strpart(path, 0, hashIdx)
  endif
  " translate file-URLs
  if stridx(path,'file://') == 0
    return strpart(path,7)
  endif
  " for everything else, look up user-defined mappings
  if exists("g:bl_urlpaths")
    for key in keys(g:bl_urlpaths)
      if stridx(path, key) == 0
        return g:bl_urlpaths[key] . strpart(path, strlen(key))
      endif
    endfor
  endif
  return path
endfunction

function! scimba#getErrors()
python <<EOF
data = urllib2.urlopen(vim.eval("g:bl_serverpath") + "/errors").readlines()
vim.command("let errors = %s" % [e.strip() for e in data])
EOF
  set errorformat+=%f:%l:%m
  let qfitems = []
  for errorstr in errors
    let error = eval(errorstr)
    let msg = error.message
    if error.multiplicity > 1
      let msg = msg . ' (' . error.multiplicity . ' times)'
    endif
    let qfitems = qfitems + [scimba#url2path(error.url) . ':' . error.lineNumber . ':' . msg]
  endfor
  cexpr join(qfitems, "\n")
endfunction

function! scimba#clearErrors()
python <<EOF
urllib2.urlopen(vim.eval("g:bl_serverpath") + "/clearerrors")
EOF
endfunction

function! scimba#traceLine()
python <<EOF

line = vim.eval("getline('.')")
fragments = line.split('/')
page = fragments[-1].split(':')[0]
line = fragments[-1].split(':')[1]

vim.command("b " + page)
vim.command(":" + line)
EOF
endfunction

function! scimba#get_visual_selection()
  let [lnum1, col1] = getpos("'<")[1:2]
  let [lnum2, col2] = getpos("'>")[1:2]
  let lines = getline(lnum1, lnum2)
  let lines[-1] = lines[-1][: col2 - 2]
  let lines[0] = lines[0][col1 - 1:]
  return join(lines, " ")
endfunction
