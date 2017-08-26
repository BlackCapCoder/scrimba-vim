# Scrimba Vim
Control [Scrimba](https://scrimba.com/) with Vim!


This is currently a work in progress. You can see video of it in action [here](https://youtu.be/EHFpQirzt18)

### Installation

Install it with your favorite package manager, I recommend Dein:

    call dein#add('BlackCapCoder/scrimba-vim')

You also need to add `userscript.js` to Tampermonkey in Chome.

### Footnotes
Scrimba is actually surprisingly sophisticated; It has its own binary protocol for tracking changes to the document. It is easy enough to update the text in the editor, but it won't get saved on the server unless you express it in terms of changes to the document.

Currently I have just reverse engineered the parts for `select all` and `paste`.
