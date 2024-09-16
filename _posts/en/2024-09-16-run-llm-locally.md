---
layout: post
title: "Local LLM: Running Ollama and Open WebUI with Docker Compose."
category:
  - Docker
excerpt: "Looking for a secure, more private, and cost-free alternative to ChatGPT, I came across Ollama and Open WebUI. These two tools allow us to run a local ChatGPT."
image: /assets/images/ollama.webp
author: Andrés
comments: true
---

**Assuming you use ChatGPT constantly and have probably heard of some of the latest open-source language models (LLMs), such as Llama 3.1, Gemma 2, and Mistral, I’m going to show you how to run one of these on your local machine using Docker and Docker Compose.**

[Ollama](https://ollama.com/) is defined as an **open-source application** that allows you to locally run, create, and share large language models with a command-line interface on macOS and Linux. And [Open WebUI](https://openwebui.com) is an **extensible self-hosted WebUI**, feature-rich and user-friendly, designed to operate completely offline.

### Advantages

The benefits of running your LLM locally can include:

- **Customization**: Running models locally gives you full control over the environment. You can tailor the models to meet your specific needs, adjust parameters, and even experiment with different configurations.

- **Reduced Costs**: If you already have a capable machine, especially one equipped with a GPU, running LLMs locally can be a cost-effective option. You don’t need to pay for expensive cloud computing resources, and you can experiment freely without worrying about API call limits or rising costs.

- **Privacy**: When you run models locally, your data stays on your machine. This ensures that sensitive information never leaves its secure environment, providing a level of privacy that cloud-based services simply cannot match. For businesses handling confidential data, this can be a crucial advantage.

**For me personally, a Ryzen 7 5600U works quite well.**

### ⚙️ Let's get to work

**If you're here, you probably already know Docker and Docker Compose, so I’ll skip any introduction to these tools.**

Create a folder/directory and then add a file named `docker-compose.yml` where you’ll add the following content:

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

Run `docker compose up` and you’re all set. You’ll have Ollama and Open WebUI running.

#### Last and Most Important Step❗

It happened that not all posts about this were clear on the topic, so I decided to write this on my blog. Ollama is an LLM 'manager' and, by default, does not contain any images. Therefore, when you first enter `localhost:3000`, you’ll see something like this:

![](/assets/images/openwebui.png)

To resolve this, you need to pull an image. For this, **you have two options**: there is a graphical way to do it from Open WebUI and another via the command line directly in the Ollama container. I used the second option; you can do this simply by executing the following line:

```bash
docker exec -it ollama-ollama-1 ollama pull llama3.1
```

Keep in mind that the container name will depend on your configurations; additionally, you may need to run it using `sudo`.

**[Here](https://ollama.com/library) you can see all the available models.**

🤓Additionally, you can interact with the model via the command line. If you enter the Ollama container, you can run `ollama run llama3.1` and interact without needing a UI.🤓

That’s all for now! Enjoy your local LLM.
