---
layout: post
title: "OasRails: Desde un Engine de Rails a Una Solucion Multi Frameworks"
category:
  - Just Ruby
  - On Rails
excerpt: "Ruby no es solo Rails, por eso dividi mi gema para documentar APIs y ahora podria funcionar con multiples frameworks."
image: /assets/images/ecosystem.png
author: Andrés
comments: true
---

Ruby es un lenguaje fácil de entender, entretenido de escribir y con buen rendimiento, pero lamentablemente su popularidad no ha aumentado en el tiempo. **Peor aún, esta popularidad se basa casi enteramente en un solo framework: [Ruby on Rails](https://rubyonrails.org/).** **Entonces, es imprescindible para los que desarrollamos en Ruby diversificar el ecosistema y desarrollar soluciones que logren funcionar cualquiera sea el framework** para así asegurar la continuidad de Ruby como un lenguaje de programación que perdure en el tiempo y que, además, no sea controlado por un puñado de empresas.

Siguiendo esta línea, descubrí un framework llamado [Rage](https://github.com/rage-rb/rage) para la creación de APIs. Ya había probado Grape y sabía de la existencia de [Padrino](https://padrinorb.com/), Sinatra y [Hanami](https://hanamirb.org/). Pero Rage me pareció simple, y además me di cuenta de que habían tomado un acercamiento muy similar (casi idéntico) al que yo había tomado en la creación de [OasRails](https://github.com/a-chacon/oas_rails) para documentar APIs: utilizaron Yard tags para generar un OAS.

**Y en ese momento me pregunté: ¿Y si OasRails no solo funciona para Rails?** Entonces comencé a mirar el código de mi gema y me di cuenta de que **gran parte del código del engine estaba en la carpeta `lib`, por lo que no era necesario que mi gema fuese un Engine de Rails.** No tenía modelos, tenía un solo controlador y una vista.

El primer intento fue crear una única gema con los diferentes adaptadores para los diferentes frameworks, pero de haber tomado ese camino, tendría que haber renombrado mi gema y los tests hubiesen sido difíciles de mantener. Solo con los dos frameworks con los que quería comenzar ya había sido un dolor de cabeza configurar simultáneamente dos dummy apps para lograr probar los adaptadores.

**Entonces fue cuando uno de los contribuidores de OasRails me alumbró el camino y me comentó que lo que podía hacer era extraer el código reutilizable de OasRails a otra gema que más tarde se llamó [OasCore](https://github.com/a-chacon/oas_core), y que cada framework tuviera su adaptador independiente que dependería de OasCore.** **De esta forma, mantendría el nombre de OasRails para Ruby on Rails y para los siguientes frameworks nacerían gemas con la nomenclatura `"Oas#{Framework Here}"`.**

Y ese fue el camino que seguí: dividí mi gema e hice dos adaptadores más: [OasRage](https://github.com/a-chacon/oas_rage) y [OasHanami](https://github.com/a-chacon/oas_hanami). De pasada, también agregué la funcionalidad de soportar referencias y utilizar un archivo base para declarar esas estructuras comunes y referenciables, haciéndolas reutilizables. Y mucho de refactorizar código, como dice Clean Code:

> Leave Code Better than You Found It.

**Ahora, respecto al ecosistema, si estás pensando en desarrollar un engine para Rails, te sugiero que lo pienses bien antes: ¿Es esto que voy a hacer específico para Rails? O ¿puedo crear una solución independiente de frameworks que ayude a todos?** **Ruby no es solo Ruby on Rails, es un lenguaje que da para mucho más.**
