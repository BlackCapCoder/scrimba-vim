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

if !exists("g:scrimba_serverpath")
  let g:scrimba_serverpath = "http://127.0.0.1:9002"
endif

if !exists("g:scrimba_pagefiletypes")
  let g:scrimba_pagefiletypes = ["html", "javascript", "php"]
endif

let g:scrimba_state = 0

command! -range -nargs=0 scrimbaEvaluateSelection call scrimbavim#EvaluateSelection()
command!        -nargs=0 scrimbaEvaluateBuffer    call scrimbavim#EvaluateBuffer()
command!        -nargs=0 scrimbaEvaluateWord      call scrimbavim#EvaluateWord()
command!        -nargs=1 scrimbaEval              call scrimbavim#evaluateJS(<f-args>)
command!        -nargs=0 scrimbaReloadPage        call scrimbavim#sendCommand("reload/page")
command!        -nargs=0 scrimbaReloadCSS         call scrimbavim#sendCommand("reload/css")
command!        -nargs=0 scrimbaConsoleClear      call scrimbavim#sendCommand("clear")
command!        -nargs=0 scrimbaConsole           edit scrimbavim/console
command!        -nargs=0 scrimbaErrors            call scrimbavim#getErrors()
command!        -nargs=0 scrimbaClearErrors       call scrimbavim#clearErrors()
command!        -nargs=0 scrimbaTraceLine         call scrimbavim#traceLine()
autocmd BufReadCmd scrimbavim/console* call scrimbavim#getConsole()

if !exists("g:scrimba_no_mappings")
  vmap <silent><Leader>be :scrimbaEvaluateSelection<CR>
  nmap <silent><Leader>be :scrimbaEvaluateBuffer<CR>
  nmap <silent><Leader>bf :scrimbaEvaluateWord<CR>
  nmap <silent><Leader>br :scrimbaReloadPage<CR>
  nmap <silent><Leader>bc :scrimbaReloadCSS<CR>
endif

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

if !exists("g:scrimba_no_autoupdate")
  call s:setupHandlers()
endif

if !exists("g:scrimba_no_eager")
  let g:scrimba_no_eager = 0
endif
