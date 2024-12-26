---
layout: post
title: "Chaski: Un Lector de Fuentes RSS/Atom para el 2025"
category:
  - Project
image: /assets/images/today.png
excerpt: "Presento Chaski, un lector de RSS/Atom simple con un diseño moderno y centrado en la privacidad que te puede servir para mantenerte actualizado."
author: Andrés
comments: true
---

Tiempo atrás descubrí cómo funcionaba RSS, **me lamento no haberlo descubierto antes**, y desde entonces lo agregué a mi blog. Luego busqué formas de seguir diferentes fuentes y fue cuando me llegó la idea de crear mi propia aplicación. Y antes de preguntarme, ¿con qué tecnología?, ya tenía la respuesta: [Tauri](https://tauri.app/).

Había descubierto Tauri mediante GitHub cuando comencé a interesarme por Rust y a mirar proyectos escritos en este lenguaje. Ya se hablaba de que la versión dos permitiría compilar una sola aplicación tanto para escritorio como para móvil, así que era mi momento. Hace cuatro meses comencé el proyecto.

## RSS

Antes de seguir, me gustaría dedicarle un espacio para explicar **qué es, cómo funciona y lo fascinante de RSS**. Antes de que llegaran las grandes empresas de tecnología con sus redes sociales y algoritmos de sugerencias, existía este formato de distribución de contenido. Básicamente depende de un "publicador" y un "cliente". El cliente, haciendo uso de una aplicación, consulta constantemente el archivo RSS del sitio "publicador", donde saldrán las noticias o entradas del sitio. Si hay entradas nuevas, entonces la aplicación las muestra. De esta forma **no hay intervención de terceros** (en teoría) y tu aplicación consulta todas las fuentes a las que estés suscrito.

Ahora, si nos ponemos a pensar en cómo funciona, es la forma más simple que tenemos de consumir la información que nosotros queremos. Es **internet en su forma más primitiva y sana**, donde no hay seguimiento ni observación constante de lo que haces como usuario. Tampoco estás propenso a ser segmentado y bombardeado con anuncios para inducir una necesidad que no tienes y terminar comprando algo que no necesitas. En fin, **cualquier contra que tengan las redes sociales masivas será un punto a favor de RSS**.

Pero, lamentablemente, RSS **no es tan popular como debería ser**, y aquí es donde entra Chaski. Mi idea sería hacer de RSS algo moderno y entretenido, con una interfaz que invite a leer y reduzca la **ansiedad de tener que consumir tanta información tan rápido para estar actualizados**.

## Pasar de Ruby a Rust

No fue fácil partir, tampoco tan complejo. Pero el hecho de no avanzar tan rápido en el desarrollo como lo haría con una aplicación web hecha con Ruby on Rails me frustraba en ciertos momentos porque quería tener algo usable lo más rápido posible.

Luego, con la ayuda de un LLM logré agarrar el ritmo, entender algunos conceptos clave de Rust como el tipado fuerte, el ownership y las estructuras. Aunque aún no entiendo del todo algunas cosas, **logré hacer funcionar la app y llegar a lo que hoy tengo en el repositorio**.

Repositorio: <https://github.com/a-chacon/chaski-app>

## Chaski: Lector de feeds

Mi enfoque para crear la app siempre ha estado basado en cosas que a mí me interesan cuando navego por internet: **privacidad, usabilidad, diseño, simpleza, funcionalidad**. Con estas ideas presentes es que comencé por cumplir algunos requisitos básicos de un lector de feeds:

- Manipular fuentes.
- Obtener entradas.
- Obtener contenido de esas entradas.
- Autodescubrir feeds para una URL dada.
- Importar/exportar feeds en formato OPML.
- Búsqueda simple por texto tanto para fuentes como para entradas.
- Organizar en carpetas (aunque requiere más trabajo aún).
- Modo claro y oscuro.
- Filtros para las entradas.

Todas estas funcionalidades ya están incluidas y tengo planes más ambiciosos aún, pero no puedo ir tan rápido como me gustaría. **Aún tengo un trabajo a tiempo completo con el que debo cumplir**. Pero dentro de las ideas para un futuro próximo están:

- Una forma de sincronizar entre dispositivos.
- Compilar para Android.
- Mejorar la extracción de los artículos.
- Comenzar un blog con RSS para la página de Chaski, donde pueda compartir las actualizaciones.
- Obviamente, integración con algún LLM (IA) para el resumen y la interacción con las entradas.
- Traducciones.

Más detalles: <https://chaski.a-chacon.com>

## Para el futuro

Tal vez el proyecto termine muerto, como muchos otros que he intentado hacer, o tal vez no. Pero crearlo en sí ya fue un disfrute. Aprender cosas nuevas siempre es motivante. Ojalá llegar a una versión que sea útil para muchos y, quién sabe, **tal vez RSS resurja nuevamente**.

El proyecto está abierto a aportes, sugerencias y cualquier comentario que sea útil. ¡Hasta la próxima!
