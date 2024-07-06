---
layout: post
title: 'SpaceVim as Your Ruby IDE: Configuration Tips and Workflow'
categories:
  - Vim
excerpt: >-
  Explore how I transformed SpaceVim into my Ruby IDE, after saying goodbye to
  Atom. SpaceVim, based on Vim/NeoVim and inspired by SpaceMacs, is an open
  source distribution backed by an active community.
image: /assets/images/spacevim.png
lang: en
time: 10 min
author: Andrés
comments: true
---
[SpaceVim](https://spacevim.org/) is defined as a Vim/NeoVim distribution. Some time ago I felt like learning how to use Vim and when I found this project
and when I found this project I was convinced to use it as my main code editor and leave Atom behind. So far I have found it excellent,
you increase productivity as you depend less and less on the mouse. I'm still not an expert in Vim, but I can move better and better in the code.
code.

And the facilities that SpaceVim includes for users who are just starting in the world of Vim are very good. For example, to install a new plugin, all you need to do is to press
press `SPC f v d` (open SpaceVim configuration file) and then type the following:

```
[[custom_plugins]]
repo = 'ryanoasis/vim-devicons'
merged = false
```

And that's it, the next time you start the editor, the plugin will install itself.

So, after a couple of months using SpaceVim I will comment what have been my configurations to use it as a code editor for Ruby (main language in which I program)
and although in the official documentation there is a [page](https://spacevim.org/use-vim-as-a-ruby-ide/) where they explain how to configure it to program with Ruby,
it seems to me that there are a couple of more details to mention for everything to work correctly.

**This post is not intended to explain how to install SpaceVim or even less Vim. That can be found [here](https://spacevim.org/quick-start-guide/).** \*\*## Syntax linting

### Syntax linting

In the `Syntax linting` section they suggest installing rubocop so that [Neomake](https://github.com/neomake/neomake) can deliver errors on your code asynchronously,
this didn't work for me and that's because rubocop's output is not compatible with Neomake, so what I did was to try `ruby-lint` which does work,
but the project seems to me a bit abandoned, even the repository is archived. So after testing I recommend that for syntax linting
use [reek](https://github.com/troessner/reek) and configure it as follows in your vimrc:

```
let g:neomake_ruby_enabled_makers = ['reek']]
```

!["Spacevim linting working"](/assets/images/spacevim-linting.gif)

### Code formatting

Para formatear el código mencionan `rufo`. Personalmente, prefiero `rubocop`, solo basta con tener rubocop y no `rufo`. Y si te parece bien puedes configurar para darle formato
al código al momento de guardar con la siguiente opción:

```
 [[layers]]
name = "lang#ruby"
format_on_save = true
```

![](/assets/images/spacevim-format-code.gif)

### Autocompletion

For me this is an important topic, the autocompletion of the code helps a lot when developing. And that's why I had to improve the default autocompletion
that SpaceVim delivers and for this I did it integrating [Solargraph](https://solargraph.org/).

The first thing you have to do is to change the default autocomplete engine to [coc](https://github.com/neoclide/coc.nvim). You do this with the following option:

```
[options]
autocomplete_method = "coc"
```

After this SpaceVim will take care of installing coc.

If you don't have the Solargraph gem installed now is the time to do it:

```
gem install solargraph
```

Then for `coc` to work with Solargraph we must install a plugin to `coc` by running the following command in Vim/NeoVim:

```
CocInstall coc-solargraph
```

And we can start enjoying good autocompletion, including documentation.

!["SpaceVim autocompletion working"](/assets/images/spacevim-autocompletion.gif)

---

And to make your Spacevim a nicer space I suggest some settings:

```
# Enable the git layer
[[layers]]
name = "git"

# Icons for your NERDTree
[[custom_plugins]]
repo = 'ryanoasis/vim-devicons'
merged = false

# Colors according to file type in NERDTree
[[custom_plugins]]
repo = 'tiagofumo/vim-nerdtree-syntax-highlight'
merged = false

# Automatically add end to the end of certain Ruby structures
[[custom_plugins]]
repo = "tpope/vim-endwise"
merged = false

# higlighter
[[custom_plugins]]
repo = "ap/vim-css-color"
merged = false
```

Finally, **if you want to achieve transparency in the background** of your SpaceVim what worked for me was to use the same color
in both SpaceVim and my terminal (the latter with transparency).

---

So, with the Ruby layer enabled, code linting, code formatting and auto-completion working we can start developing without any problems.
SpaceVim comes with many more built-in features that can help you (search methods, terminal, todo manager, etc.) just look in its documentation or ask through the channels maintained by the community.

If you are just starting with Vim I suggest the following video:

- <https://youtu.be/RZ4p-saaQkc> <https://youtu.be/RZ4p-saaQkc>

