---
layout: post
title: "Documentando APIs en Ruby: OasCore, OasRails, OasHanami ..."
category:
  - Ruby
excerpt: "¿Que pasaria si chatGPT y DeepSeek lograran hablar entre si?. Hice la prueba y me sorprendio el resultado."
image: /assets/images/llmchat.png
author: Andrés
comments: true
---

Ruby es un lenguaje facil de entender, entretenido de escribir y con buen rendimiento, pero lamentablemente su popularidad no ha aumentado en el tiempo. Peor aun, esta popularidad se basa casi enteramente en un solo framework: Ruby On Rails. Entonces es impresindible para los que desarrollamos en Ruby diversificar el ecosistema y desarrollar soluciones que logren funcionar cualquiera sea el frameowork para asi asegurar la continuida de Ruby como un lenguaje de programacion que perdure en el tiempo y que ademas no sea controlado por un puñado de empresas.

Siguiendo esta linea descubri un framework llamado [Rage]() para la creacion de APIs, ya habia probado Grape y sabia de la existencia de Padrino, Sinatra y Hanami. Pero Rage me parecio simple, y ademas me di cuenta que habian tomado un acercamiento muy similar (casi identico) al que yo habia tomado en la creacion de OasRails para documentar APIs: Utilizaron Yard tags para generar un OAS.

Y en ese momento me pregunte ¿Y si OasRails no solo funciona para Rails? entonces comence a mirar el codigo de mi gema y me di cuenta que gran parte del codigo del engine estaba en la carpeta `lib`, por lo que no era necesario que mi gema fuese un Engine de Rails, no tenia modelos, tenia un solo controlador y una vista.

El primer intento fue crear una unica gema con los diferentes adaptadores para los diferentes frameworks, pero de haber tomado ese camino tendria que haber renombrado mi gema y los tests hubiesen sido dificiles de mantener, solo con los dos frameworks con los que queria comenzar ya habia sido un dolor de cabeza configurar simultaneamente dos dummy apps para lograr probar los adaptadores.

Entonces fue cuando uno de los contribudores de OasRails que me alumbro el camino y me comento que lo que podia hacer era extraer el codigo reutilizable de OasRails a otra gema que mas tarde se llamo OasCore, y que cada frameowork tuviera su adaptador independiente que dependeria de OasCore. De esta forma mantendria el nombre de OasRails para Ruby On Rails y para los siguientes frameowokr nacerian gemas como: OasRage y OasHanami.

Y ese fue el camino que segui, luego agregue un
