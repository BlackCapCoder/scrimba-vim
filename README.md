# Scrimba Vim
Control [Scrimba](https://scrimba.com/) with Vim!


### Usage

Create a new (or open an existing) project in Scrimba. Fire up Vim and run `:ScrimbaDownload` to download all the files in the project to the current directory. Any changes you make to these files will be synced with Scrimba.

If you already have the files and closed Vim for some reason, you can connect to Scrimba with `:ScrimbaStart`

You can see video of it in action [here](https://youtu.be/C2Se1IdfYLE)

Scrimba Vim now supports enough of the Scrimba protocol for other people to be able to watch you code live.


### Installation

Install it with your favorite package manager, I recommend Dein:

    call dein#add('BlackCapCoder/scrimba-vim')

You also need to add `userscript.js` to Tampermonkey in Chome.


### Why is this slowing down Vim?

I sync the file with Scrimba whenever you change text, and send the cursor position whenever you move the cursor. The delay is slight, but will be noticeable to seasoned Vim users. If you would like less frequent updates you can remove autocommmands from `plugin/scrimbavim.vim`.

### Footnotes
Scrimba is actually surprisingly sophisticated; It has its own binary protocol for tracking changes to the document. It is easy enough to update the text in the editor, but it won't get saved on the server unless you express it in terms of changes to the document.

Currently I have just reverse engineered the parts for `select all`, `paste`, `move cursor` and `switch file`. I am not planning to implement visual selection, because Scrimba does not support block selection, and I think it would be unintuitive to support one but not the other.
