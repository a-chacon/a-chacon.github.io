---
layout: post
title: "Running LLM Locally: DeepSeek R1 and Open WebUI with Docker Compose."
category:
  - Docker
excerpt: "DeepSeek is making waves in the AI scene, an open-source and accessible LLM that has caused NVIDIA and other companies' stock prices to drop. And of course, just like Ollama, we can also run this model locally to see how it performs."
image: /assets/images/deepseek.jpg
author: Andrés
comments: true
---

**Assuming you use ChatGPT regularly and have probably heard about some of the latest open-source language models (LLMs), such as Llama 3.1, Gemma 2, Mistral, or DeepSeek, I’m going to show you how to run the latter on your local machine using Docker and Docker Compose.**

DeepSeek is an open-source artificial intelligence language model developed by a Chinese company. It is a transparent and accessible alternative to other private LLMs, allowing its use and modification for both research and commercial applications.

I won’t deny it, I’m enjoying watching the monopoly of OpenAI and its closed-source LLM crumble in the face of an open-source and much more economical alternative, both in terms of price and resource consumption.

[Ollama](https://ollama.com/) is defined as an **open-source application** that allows you to run, create, and share large language models locally with a command-line interface on macOS and Linux. And [Open WebUI](https://openwebui.com) is an **extensible, feature-rich, and easy-to-use self-hosted WebUI**, designed to operate completely offline.

### Advantages

The advantages of running your LLM locally can be:

- **Customization**: Running models locally gives you full control over the environment. You can fine-tune the models to suit your specific needs, adjust parameters, and even experiment with different configurations.

- **Reduced Costs**: If you already have a capable machine, especially one equipped with a GPU, running LLMs locally can be a cost-effective option. There’s no need to pay for expensive cloud computing resources, and you can experiment freely without worrying about API call limits or rising costs.

- **Privacy**: When you run models locally, your data stays on your machine. This ensures that sensitive information never leaves your secure environment, providing a level of privacy that cloud-based services simply cannot match. For businesses handling confidential data, this can be a crucial advantage.

**For me, personally, it works quite well with a Ryzen 7 5600U.**

### ⚙️ Let’s Get Started

**If you’re here, you probably already know Docker and Docker Compose, so I’ll skip any introduction to these tools.**

Create a folder/directory and then add a file called `docker-compose.yml` where you’ll include the following content:

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

Run `docker compose up`, and that’s it. You’ll have Ollama and Open WebUI up and running.

#### Final and Most Important Step❗

I noticed that not all posts about this were clear on the topic, which is why I decided to write this on my blog. Ollama is an LLM 'manager,' and by default, it doesn’t contain any models. So, when you first visit `localhost:3000`, you’ll see something like this:

![Open Web UI empty without models](/assets/images/openwebui.png)

To fix this, you need to pull a model. For this, **you have two options**: there’s a graphical way to do it from Open WebUI and another via the command line directly in the Ollama container. I used the second option; you can do it simply by running the following command:

```bash
docker exec -it ollama-ollama-1 ollama pull deepseek-r1
```

Keep in mind that the container name will depend on your configurations; additionally, you’ll likely need to run it using `sudo`.

**[Here](https://ollama.com/library) you can see all the available models.**

🤓Additionally, you can interact with the model via the command line. If you enter the Ollama container, you can run `ollama run deepseek-r1` and interact without needing a UI.🤓

That’s it for now! Enjoy your local LLM.
