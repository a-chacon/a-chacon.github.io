---
title: "CanI: ¿Puedo hacer actividades al aire libre?"
layout: project
image: /assets/images/cani.png
category: Monolith
tags:
  - Rails
  - Tailwindcss
order: 0
---

## Acerca del Proyecto

CanI es un side project que desarrollé para practicar y mejorar mis habilidades en Ruby on Rails, APIs y desarrollo web. Su objetivo es simple: ayudarte a decidir si el clima es adecuado para realizar actividades al aire libre.

Página web: <https://i.a-chacon.com>

## ¿Cómo funciona?

La aplicación analiza parámetros climáticos clave como:

- **Temperatura**: ¿Es demasiado frío o caluroso para la actividad?
- **Humedad**: ¿Afectará el secado o la comodidad?
- **Viento**: ¿Hay ráfagas fuertes que puedan interferir?
- **Índice UV**: ¿Es seguro estar al aire libre sin protección?
- **Lluvia**: ¿Habrá precipitaciones durante la actividad?

Estos datos se obtienen en tiempo real de OpenWeather API y se procesan para ofrecerte una recomendación clara.

## Tecnologías utilizadas

- **Ruby on Rails** (backend)
- **Tailwind CSS** (diseño)
- **SQLite** (base de datos local)
- **OpenWeather API** (datos climáticos)
- **Unsplash API** (imágenes de fondo)
- **Mapbox API** (geolocalización)
