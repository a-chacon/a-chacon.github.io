---
layout: post
title: 'SpaceVim como IDE para Ruby: Consejos de configuración y flujo de trabajo'
categories:
  - Vim
excerpt: >-
  Explora cómo transformé SpaceVim en mi IDE de Ruby, tras decir adiós a Atom.
  SpaceVim, basado en Vim/NeoVim e inspirado en SpaceMacs, es una distribución
  de código abierto respaldada por una activa comunidad
image: /assets/images/spacevim.png
lang: es
time: 10 min
author: Andrés
comments: true
---
[SpaceVim](https://spacevim.org/) se define como una distribución de Vim/NeoVim. Hace un tiempo me dieron ganas por aprender a usar Vim y cuando
encontré este proyecto fue que me convencí de usarlo como mi editor de código principal y dejar atrás Atom. Hasta el momento me ha parecido excelente,
aumentas la productividad a medida que vas dependiendo cada vez menos del mouse. Aún no soy un experto en Vim, pero puedo moverme cada vez mejor dentro
del código.

Y las facilidades que incluye SpaceVim para usuarios que están recién empezando en el mundo de Vim son muy buenas. Por ejemplo, para instalar un nuevo plugin, solo basta
con presionar `SPC f v d` (abrir archivo de configuraciones de SpaceVim) y luego escribir lo siguiente:

```
[[custom_plugins]]
repo = 'ryanoasis/vim-devicons'
merged = false
```

Y eso es todo, la siguiente vez que inicies el editor, el plugin se instalara por sí solo.

Entonces, luego de un par de meses usando SpaceVim comentaré cuáles han sido mis configuraciones para usarlo como editor de código de Ruby (Lenguage principal en el que programo)
y aunque en la documentación oficial existe una [página](https://spacevim.org/use-vim-as-a-ruby-ide/) donde explican como configurarlo para programar con Ruby,
me parece que hay un par de detalles más que mencionar para que todo funcione correctamente.

**Este post no pretende explicar como instalar SpaceVim ni menos Vim. Eso lo puedes encontrar [aquí](https://spacevim.org/quick-start-guide/).**

### Syntax linting

En la sección de `Syntax linting` sugieren instalar rubocop para que [Neomake](https://github.com/neomake/neomake) pueda entregarte errores sobre tu código de forma asíncrona,
esto no me funciono y es porque la salida de Rubocop no es compatible con Neomake, entonces lo que hice fue probar `ruby-lint` que si funciona,
pero el proyecto me parece un poco abandonado, incluso el repositorio está archivado. Así que luego de probar recomiendo que para syntax linting
uses [reek](https://github.com/troessner/reek) y lo configures de la siguiente manera en tu vimrc:

```
let g:neomake_ruby_enabled_makers = ['reek']
```

![](/assets/images/spacevim-linting.gif)

### Code formatting

Para formatear el código mencionan `rufo`. Personalmente, prefiero `rubocop`, solo basta con tener rubocop y no `rufo`. Y si te parece bien puedes configurar para darle formato
al código al momento de guardar con la siguiente opción:

```
 [[layers]]
name = "lang#ruby"
format_on_save = true
```

![](/assets/images/spacevim-format-code.gif)

### Autocompletado

Para mi este es un tema importante, el autocompletado del código ayuda bastante al momento de estar desarrollando. Y es por eso que si o si tenía que mejorar el autocompletado por defecto
que entrega SpaceVim y para esto lo hice integrando [Solargraph](https://solargraph.org/).

Lo primero que tienes que hacer es cambiar el engine de autocompletado por defecto a [coc](https://github.com/neoclide/coc.nvim). Esto lo haces con la siguiente opción:

```
[options]
autocomplete_method = "coc"
```

Despues de esto SpaceVim se encargará de instalar coc.

Si no tienes la gema de Solargraph instalada es el momento para hacerlo:

```
gem install solargraph
```

Luego para que `coc` nos funcione con Solargraph debemos instalar un plugin a `coc` corriendo el siguiente comando en Vim/NeoVim:

```
:CocInstall coc-solargraph
```

Y podemos empezar a disfrutar de un buen autocompletado, incluyendo documentación.

![](/assets/images/spacevim-autocompletion.gif)

---

Y para que tu Spacevim sea un espacio más agradable te sugiero algunas configuraciones:

```
# Habilitar la capa git
[[layers]]
name = "git"

# Iconos para tu NERDTree
[[custom_plugins]]
repo = 'ryanoasis/vim-devicons'
merged = false

# Colores segun tipo de archivo en NERDTree
[[custom_plugins]]
repo = 'tiagofumo/vim-nerdtree-syntax-highlight'
merged = false

# Agrega automaticamente end al final de ciertas estructuras en Ruby
[[custom_plugins]]
repo = "tpope/vim-endwise"
merged = false

# higlighter
[[custom_plugins]]
repo = "ap/vim-css-color"
merged = false
```

Por último, **si quieres lograr la transparencia en el fondo** de tu SpaceVim lo que me resulto a mí fue usar el mismo color
tanto en SpaceVim como en mi terminal (Esta ultima con transparencia).

---

Entonces, teniendo la capa de Ruby activada, code linting, el formateo del código y el autocompletado funcionando podemos empezar a desarrollar sin problemas.
SpaceVim viene con muchas más funcionalidades integradas que te pueden ayudar (metodos para buscar, terminal, todo manager, etc.) solo hay que buscar en su documentación o preguntar por los canales que mantiene la comunidad.

Si estás recién empezando con Vim te sugiero el siguiente video:

- <https://youtu.be/RZ4p-saaQkc>

