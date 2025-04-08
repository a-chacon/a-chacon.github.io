---
layout: post
title: "Documentación automática de APIs Rails con OasRails e IA: Rápido y fácil."
category:
  - On Rails
excerpt: "Automatiza la documentación de APIs en Rails con OasRails y su documentación optimizada para IA (llms.txt). Genera especificaciones OpenAPI sin esfuerzo y acelera tu flujo de trabajo con modelos de lenguaje."
image: https://a-chacon.com/oas_rails/assets/rails_theme.png
author: Andrés
comments: true
---

Hace unos días lancé una nueva versión de OasRails y, junto con esto, moví la documentación desde el README hacia un [mdbook](https://github.com/rust-lang/mdBook) (¡Muy buena herramienta!) donde también aproveché de convertirlo al formato [llms.txt](https://llmstxt.org/).

**/llms.txt** se define como:

>> A proposal to standardize on using an /llms.txt file to provide information to help LLMs use a website at inference time.

Con esto, me pareció interesante poder darle más contexto a nuestros editores para que el proceso de documentar una API sea rápido y no necesite tanto esfuerzo, además de evitar errores de tipeo. Y seamos honestos, a todos nos da flojera documentar, hehe. Así que es una buena tarea para encargársela a estos modelos de lenguaje.

Y, que es OasRails? Lee mas [aqui](/on rails/2024/07/25/documenting-rails-apis.html).

---

## **OasRails + IA = Menos documentación manual**

OasRails ya generaba un OpenAPI Spec de forma automatica desde tu codigo con la ayuda de documentacion que tu agregas de forma manual con [YARD](https://yardoc.org/), pero ahora este proceso puede ser aun mas facil. Puedes:

1. **Preguntarle a ChatGPT** sobre tu API como si fuera un experto.  
2. **Integrar la doc en Cursor** para tener respuestas en tiempo real mientras programas.  
3. **Automatizar migraciones** desde Swagger o documentación manual.  

---

## **Cómo funciona (en 3 pasos)**  

### **1. Elige el archivo**  

OasRails genera archivos `.txt` optimizados para IA:

- [llms.txt](https://a-chacon.com/oas_rails/llms.txt): Lo básico para entender la estructura y qué hace OasRails. (En trabajo)
- [llms-full.txt](https://a-chacon.com/oas_rails/llms-full.txt): Toda la descripción específica sobre el uso de OasRails y cómo documentar los endpoints. (**Por ahora el recomendado**)

### **2. Cárgalo en tu herramienta favorita**  

Mi editor de código es NeoVim y utilizo la IA mediante Avante, un plugin que trata de replicar Cursor, pero actualmente no soporta cargar contexto de fuentes externas. Por lo tanto, para el ejemplo, usé Cursor. No lo recomiendo para nada, ya que es de código cerrado y no se alinea con mis principios, pero me sirvió para el ejemplo y lo eliminé, jeje.

<video controls>
  <source src="/assets/images/cursor+oasrails.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### **3. Pregunta como si nada**  

Ejemplos de lo que puedes preguntar:  

- *"¿Cómo documentar autenticación JWT en OasRails?"*  
- *"Documenta el endpoint..."*  
- *"Agrega ejemplos sobre posibles request body para el método create."*

---

## **Migrar desde apipie-rails u otra herramienta (sin dolor)**  

Si ya tienes documentación escrita en otra herramienta como apipie-rails, solo debes pedirle a tu IA que lo traduzca usando los tags de OasRails.

---

## **Para cerrar**  

Documentar APIs es una tarea necesaria pero que consume tiempo, especialmente cuando se hace manualmente. Con **OasRails**, automatizas gran parte de este proceso, generando especificaciones OpenAPI directamente desde tu código. Ahora, al combinar esta herramienta con modelos de lenguaje como ChatGPT, puedes acelerar aún más la creación y mantenimiento de la documentación, reduciendo errores y ahorrando algunas horas de trabajo.  

¿Ya probaste OasRails? [Déjame un star en GitHub](https://github.com/a-chacon/oas_rails) y cuéntame cómo te va.

¿Preguntas o sugerencias? ¡Estoy atento!
