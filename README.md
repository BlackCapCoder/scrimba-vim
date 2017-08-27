# Scrimba Vim
Control [Scrimba](https://scrimba.com/) with Vim!


### Usage

Create a new (or open an existing) project in Scrimba. Fire up Vim and run `:ScrimbaDownload` to download all the files in the project to the current directory. Any changes you make to these files will be synced with Scrimba.

If you already have the files, and closed Vim for some reason, you can connect to Scrimba with `:ScrimbaStart`

You can see video of it in action [here](https://youtu.be/DUdi2Ou4YRc)


### Installation

Install it with your favorite package manager, I recommend Dein:

    call dein#add('BlackCapCoder/scrimba-vim')

You also need to add `userscript.js` to Tampermonkey in Chome.


### Footnotes
Scrimba is actually surprisingly sophisticated; It has its own binary protocol for tracking changes to the document. It is easy enough to update the text in the editor, but it won't get saved on the server unless you express it in terms of changes to the document.

Currently I have just reverse engineered the parts for `select all` and `paste`.
