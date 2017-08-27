" File:        scrimbavim.vim
" Version:     2.6.0
" Description: Links VIM to your browser for live/responsive editing.
" Maintainer:  Jonathan Warner <jaxbot@gmail.com> <http://github.com/jaxbot>
" Homepage:    http://jaxbot.me/
" Repository:  https://github.com/jaxbot/scrimbavim.vim
" License:     Copyright (C) 2014 Jonathan Warner
"              Released under the MIT license
"        ======================================================================
"

if !exists("g:bl_serverpath")
  let g:bl_serverpath = "http://127.0.0.1:9002"
endif

if !exists("g:bl_pagefiletypes")
  let g:bl_pagefiletypes = ["html", "javascript", "php"]
endif

let g:bl_state = 0

command! -range -nargs=0 BLEvaluateSelection call scrimbavim#EvaluateSelection()
command!        -nargs=0 BLEvaluateBuffer    call scrimbavim#EvaluateBuffer()
command!        -nargs=0 BLEvaluateWord      call scrimbavim#EvaluateWord()
command!        -nargs=1 BLEval              call scrimbavim#evaluateJS(<f-args>)
command!        -nargs=0 BLReloadPage        call scrimbavim#sendCommand("reload/page")
command!        -nargs=0 BLReloadCSS         call scrimbavim#sendCommand("reload/css")
command!        -nargs=0 BLConsoleClear      call scrimbavim#sendCommand("clear")
command!        -nargs=0 BLConsole           edit scrimbavim/console
command!        -nargs=0 BLErrors            call scrimbavim#getErrors()
command!        -nargs=0 BLClearErrors       call scrimbavim#clearErrors()
command!        -nargs=0 BLTraceLine         call scrimbavim#traceLine()
autocmd BufReadCmd scrimbavim/console* call scrimbavim#getConsole()

if !exists("g:bl_no_mappings")
  vmap <silent><Leader>be :BLEvaluateSelection<CR>
  nmap <silent><Leader>be :BLEvaluateBuffer<CR>
  nmap <silent><Leader>bf :BLEvaluateWord<CR>
  nmap <silent><Leader>br :BLReloadPage<CR>
  nmap <silent><Leader>bc :BLReloadCSS<CR>
endif

function! s:autoReload()
  if index(g:bl_pagefiletypes, &ft) >= 0
    call scrimbavim#sendCommand("reload/page")
  endif
endfunction

function! s:setupHandlers()
  au CursorMoved index.html call scrimbavim#sendCursor()
  au CursorMoved index.css call scrimbavim#sendCursor()
  au CursorMoved index.js call scrimbavim#sendCursor()

  au BufRead index.html call scrimbavim#fileChanged()
  au BufRead index.css call scrimbavim#fileChanged()
  au BufRead index.js call scrimbavim#fileChanged()

  au InsertLeave index.html w|call scrimbavim#reloadGeneric()
  au InsertLeave index.css w|call scrimbavim#reloadGeneric()
  au InsertLeave index.js w|call scrimbavim#reloadGeneric()

  au BufWritePost * call scrimbavim#reloadGeneric()
endfunction

if !exists("g:bl_no_autoupdate")
  call s:setupHandlers()
endif

if !exists("g:bl_no_eager")
  let g:bl_no_eager = 0
endif
