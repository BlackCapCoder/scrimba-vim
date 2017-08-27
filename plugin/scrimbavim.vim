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

command! -range -nargs=0 ScrimbaEvaluateSelection call scrimbavim#EvaluateSelection()
command!        -nargs=0 ScrimbaEvaluateBuffer    call scrimbavim#EvaluateBuffer()
command!        -nargs=0 ScrimbaEvaluateWord      call scrimbavim#EvaluateWord()
command!        -nargs=1 ScrimbaEval              call scrimbavim#evaluateJS(<f-args>)
command!        -nargs=0 ScrimbaReloadPage        call scrimbavim#sendCommand("reload/page")
command!        -nargs=0 ScrimbaReloadCSS         call scrimbavim#sendCommand("reload/css")
command!        -nargs=0 ScrimbaConsoleClear      call scrimbavim#sendCommand("clear")
command!        -nargs=0 ScrimbaConsole           edit scrimbavim/console
command!        -nargs=0 ScrimbaErrors            call scrimbavim#getErrors()
command!        -nargs=0 ScrimbaClearErrors       call scrimbavim#clearErrors()
command!        -nargs=0 ScrimbaTraceLine         call scrimbavim#traceLine()
command!        -nargs=0 ScrimbaStart             call scrimbavim#start()
command!        -nargs=0 ScrimbaDownload          call scrimbavim#download()

autocmd BufReadCmd scrimbavim/console* call scrimbavim#getConsole()

if !exists("g:scrimba_no_mappings")
  vmap <silent><Leader>be :ScrimbaEvaluateSelection<CR>
  nmap <silent><Leader>be :ScrimbaEvaluateBuffer<CR>
  nmap <silent><Leader>bf :ScrimbaEvaluateWord<CR>
  nmap <silent><Leader>br :ScrimbaReloadPage<CR>
  nmap <silent><Leader>bc :ScrimbaReloadCSS<CR>
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
  au InsertLeave style.css w|call scrimbavim#reloadGeneric()
  au InsertLeave index.js w|call scrimbavim#reloadGeneric()

  au BufWritePost * call scrimbavim#reloadGeneric()
endfunction

if !exists("g:scrimba_no_autoupdate")
  call s:setupHandlers()
endif

if !exists("g:scrimba_no_eager")
  let g:scrimba_no_eager = 0
endif
