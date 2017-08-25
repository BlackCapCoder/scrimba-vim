" File:        scimba.vim
" Version:     2.6.0
" Description: Links VIM to your browser for live/responsive editing.
" Maintainer:  Jonathan Warner <jaxbot@gmail.com> <http://github.com/jaxbot>
" Homepage:    http://jaxbot.me/
" Repository:  https://github.com/jaxbot/scimba.vim
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

command! -range -nargs=0 BLEvaluateSelection call scimba#EvaluateSelection()
command!        -nargs=0 BLEvaluateBuffer    call scimba#EvaluateBuffer()
command!        -nargs=0 BLEvaluateWord      call scimba#EvaluateWord()
command!        -nargs=1 BLEval              call scimba#evaluateJS(<f-args>)
command!        -nargs=0 BLReloadPage        call scimba#sendCommand("reload/page")
command!        -nargs=0 BLReloadCSS         call scimba#sendCommand("reload/css")
command!        -nargs=0 BLConsoleClear      call scimba#sendCommand("clear")
command!        -nargs=0 BLConsole           edit scimba/console
command!        -nargs=0 BLErrors            call scimba#getErrors()
command!        -nargs=0 BLClearErrors       call scimba#clearErrors()
command!        -nargs=0 BLTraceLine         call scimba#traceLine()
autocmd BufReadCmd scimba/console* call scimba#getConsole()

if !exists("g:bl_no_mappings")
  vmap <silent><Leader>be :BLEvaluateSelection<CR>
  nmap <silent><Leader>be :BLEvaluateBuffer<CR>
  nmap <silent><Leader>bf :BLEvaluateWord<CR>
  nmap <silent><Leader>br :BLReloadPage<CR>
  nmap <silent><Leader>bc :BLReloadCSS<CR>
endif

function! s:autoReload()
  if index(g:bl_pagefiletypes, &ft) >= 0
    call scimba#sendCommand("reload/page")
  endif
endfunction

function! s:setupHandlers()
  au BufWritePost * call s:autoReload()
  au BufWritePost *.css :BLReloadCSS
endfunction

if !exists("g:bl_no_autoupdate")
  call s:setupHandlers()
endif

if !exists("g:bl_no_eager")
  let g:bl_no_eager = 0
endif

