---
layout: post
title: "LLM en local: Corriendo Ollama y Open WebUI con Docker Compose."
category:
  - Docker
excerpt: "Buscando una alternativa segura, más privada y con costo 0 a ChatGPT, llegué a Ollama y Open WebUI. Estas dos herramientas nos permiten correr un ChatGPT localmente."
image: /assets/images/ollama.webp
author: Andrés
comments: true
---

**Suponiendo que usas ChatGPT constantemente y que probablemente hayas oído hablar de algunos de los últimos modelos lingüísticos de código abierto (LLM), como Llama 3.1, Gemma 2 y Mistral, te voy a mostrar cómo correr uno de estos en tu máquina local mediante Docker y Docker Compose.**

[Ollama](https://ollama.com/) se define como una **aplicación de código abierto** que permite ejecutar, crear y compartir localmente grandes modelos lingüísticos con una interfaz de línea de comandos en macOS y Linux. Y [Open WebUI](https://openwebui.com) es una **WebUI autoalojada extensible**, rica en características y fácil de usar, diseñada para operar completamente fuera de línea.

### Ventajas

Las ventajas que te puede traer tener tu LLM corriendo en local pueden ser:

- **Personalización**: Ejecutar los modelos localmente te ofrece un control total sobre el entorno. Puedes ajustar los modelos para adaptarlos a tus necesidades específicas, ajustar los parámetros e incluso experimentar con diferentes configuraciones.

- **Costes reducidos**: Si ya dispones de una máquina capaz, especialmente una equipada con una GPU, ejecutar LLMs localmente puede ser una opción rentable. No es necesario pagar por costosos recursos de computación en la nube y puedes experimentar libremente sin preocuparte por los límites de llamadas a la API ni por el aumento de los costes.

- **Privacidad**: Cuando ejecutas modelos localmente, tus datos permanecen en tu máquina. Esto garantiza que la información confidencial nunca salga de su entorno seguro, proporcionando un nivel de privacidad que los servicios basados en la nube simplemente no pueden igualar. Para las empresas que manejan datos confidenciales, esto puede ser una ventaja crucial.

**Para mí, a nivel personal, me funciona bastante bien con un Ryzen 7 5600U.**

### ⚙️ Manos a la obra

**Probablemente, si estás aquí ya conoces Docker y Docker Compose, así que me saltaré cualquier introducción a estas herramientas.**

Crea una carpeta/directorio y luego agrega un archivo llamado `docker-compose.yml` donde agregarás el siguiente contenido:

```yml
services:
  webui:
    image: ghcr.io/open-webui/open-webui:main
    ports:
      - 3000:8080/tcp
    volumes:
      - open-webui:/app/backend/data
    extra_hosts:
      - "host.docker.internal:host-gateway"
    depends_on:
      - ollama

  ollama:
    image: ollama/ollama
    expose:
      - 11434/tcp
    ports:
      - 11434:11434/tcp
    healthcheck:
      test: ollama --version || exit 1
    volumes:
      - ollama:/root/.ollama

volumes:
  ollama:
  open-webui:
```

Ejecuta `docker compose up` y listo. Tendrás Ollama y Open WebUI corriendo.

#### Último y más importante paso❗

Me pasó que no todos los posts acerca de esto fueron claros con el tema, y por eso decidí escribir esto en mi blog. Ollama es un 'gestor' de LLMs y, por defecto, no contiene ninguna imagen. Por lo que, cuando entres por primera vez a `localhost:3000`, verás algo como esto:

![](/assets/images/openwebui.png)

Para solucionarlo, tienes que hacer pull de alguna imagen. Para esto **tienes dos opciones**: existe una forma gráfica de hacerlo desde Open WebUI y otra por línea de comandos directamente en el contenedor de Ollama. Esta segunda opción fue la que usé yo; puedes hacerlo simplemente ejecutando la siguiente línea:

```bash
docker exec -it ollama-ollama-1 ollama pull llama3.1
```

Ten en cuenta que el nombre del contenedor dependerá de tus configuraciones; además, probablemente debas ejecutarlo usando `sudo`.

**[Aquí](https://ollama.com/library) puedes ver todos los modelos disponibles.**

🤓Además, puedes interactuar con el modelo a nivel de línea de comandos. Si entras al contenedor de Ollama, puedes ejecutar `ollama run llama3.1` e interactuar sin la necesidad de una UI.🤓

¡Hasta aquí por ahora! Disfruta de tu LLM local.
