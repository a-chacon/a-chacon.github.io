---
layout: post
title: "Automatic API Documentation for Rails with OasRails and AI: Fast and Easy"
category:
  - On Rails
excerpt: "Automate API documentation in Rails with OasRails and its AI-optimized documentation (llms.txt). Effortlessly generate OpenAPI specifications and accelerate your workflow with language models."
image: https://a-chacon.com/oas_rails/assets/rails_theme.png
author: Andrés
comments: true
---

A few days ago, I released a new version of OasRails, and along with that, I moved the documentation from the README to an [mdbook](https://github.com/rust-lang/mdBook) (Great tool!) where I also took the opportunity to convert it to the [llms.txt](https://llmstxt.org/) format.

**/llms.txt** is defined as:

>> A proposal to standardize using an /llms.txt file to provide information to help LLMs use a website at inference time.

With this, I thought it would be interesting to provide more context to our editors so that the process of documenting an API is quick and doesn’t require much effort, plus it helps avoid typos. And let's be honest, nobody likes documenting, hehe. So, it's a good task to delegate to these language models.

And what is OasRails? Read more [here](/on rails/2024/07/25/documenting-rails-apis.html).

---

## **OasRails + AI = Less Manual Documentation**

OasRails already generated an OpenAPI Spec automatically from your code with the help of documentation you add manually using [YARD](https://yardoc.org/), but now this process can be even easier. You can:

1. **Ask ChatGPT** about your API as if it were an expert.  
2. **Integrate the doc in Cursor** to get real-time answers while coding.  
3. **Automate migrations** from Swagger or manual documentation.  

---

## **How It Works (in 3 Steps)**

### **1. Choose the File**

OasRails generates `.txt` files optimized for AI:

- <a {% static_href %}href="https://a-chacon.com/oas_rails/llms.txt"{% endstatic_href %}>llms.txt</a>: The basics to understand the structure and what OasRails does. (Work in progress)

- <a {% static_href %}href="https://a-chacon.com/oas_rails/llms-full.txt"{% endstatic_href %}>llms-full.txt</a>: Full description about using OasRails and how to document endpoints. (**Currently recommended**)

### **2. Load It Into Your Favorite Tool**

My code editor is NeoVim, and I use AI through Avante, a plugin that tries to replicate Cursor, but it currently doesn't support loading context from external sources. So for this example, I used Cursor. I wouldn't recommend it at all, as it is closed-source and doesn't align with my principles, but it worked for the demo, and I removed it afterward, hehe.

<video controls>
  <source src="/assets/images/cursor+oasrails.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### **3. Ask as if It's Nothing**

Examples of what you can ask:

- *"How to document JWT authentication in OasRails?"*  
- *"Document the endpoint..."*  
- *"Add examples of possible request bodies for the create method."*

---

## **Migrate from apipie-rails or Another Tool (Without Pain)**

If you already have documentation written in another tool like apipie-rails, just ask your AI to translate it using OasRails tags.

---

## **To Close**

Documenting APIs is a necessary but time-consuming task, especially when done manually. With **OasRails**, you automate much of this process by generating OpenAPI specifications directly from your code. Now, by combining this tool with language models like ChatGPT, you can speed up the creation and maintenance of documentation, reducing errors and saving some hours of work.

Have you tried OasRails yet? [Leave me a star on GitHub](https://github.com/a-chacon/oas_rails) and let me know how it goes.

Questions or suggestions? I'm all ears!
