---
layout: post
title: "Chaski: A Feed Reader for 2025"
category:
  - Project
image: /assets/images/today.png
excerpt: "Introducing Chaski, a simple RSS/Atom feed reader with a modern design and privacy-focused approach that helps you stay updated."
author: Andrés
comments: true
---

Some time ago, I discovered how RSS works. **I regret not discovering it sooner**, and since then, I added it to my blog. Later, I looked for ways to follow different sources, and that's when the idea of creating my own application came to me. Before even asking myself, "What technology should I use?" I already had the answer: [Tauri](https://tauri.app/).

I discovered Tauri through GitHub when I started getting interested in Rust and exploring projects written in this language. There was already talk about version two allowing a single application to be compiled for both desktop and mobile, so the time was right. Four months ago, I started the project.

## RSS

Before continuing, I’d like to dedicate some space to explain **what RSS is, how it works, and why it’s fascinating**. Before big tech companies arrived with their social networks and recommendation algorithms, this content distribution format existed. Essentially, it depends on a "publisher" and a "client." The client, using an application, constantly checks the RSS file of the "publisher" site, where the site's news or entries will appear. If there are new entries, the application displays them. In this way, **there’s no third-party intervention** (in theory), and your application queries all the sources you subscribe to.

Now, if we think about how it works, it’s the simplest way to consume the information we want. It’s **the internet in its most primitive and healthy form**, where there’s no tracking or constant monitoring of what you do as a user. You’re not segmented or bombarded with ads designed to create a need you don’t have, leading you to buy something you don’t need. In short, **any downside of massive social networks is a strong point in favor of RSS**.

Unfortunately, RSS **isn’t as popular as it should be**, and that’s where Chaski comes in. My idea is to make RSS modern and engaging, with an interface that invites reading and reduces the **anxiety of consuming so much information so quickly to stay updated**.

## Switching from Ruby to Rust

It wasn’t easy to start, but it wasn’t overly complex either. However, not progressing as quickly in development as I would with a web application built with Ruby on Rails frustrated me at times because I wanted to have something usable as soon as possible.

Later, with the help of an LLM, I got into the rhythm, understood some key Rust concepts like strong typing, ownership, and structures. Although I still don’t fully understand some things, **I managed to get the app working and reached the point I’m at today with the repository**.

Repository: <https://github.com/a-chacon/chaski-app>

## Chaski: Feed Reader

My approach to creating the app has always been based on things that interest me when browsing the internet: **privacy, usability, design, simplicity, and functionality**. With these ideas in mind, I started by meeting some basic requirements for a feed reader:

- Managing sources.
- Retrieving entries.
- Getting content from those entries.
- Auto-discovering feeds for a given URL.
- Importing/exporting feeds in OPML format.
- Simple text search for both sources and entries.
- Organizing into folders (although this needs more work).
- Light and dark modes.
- Filters for entries.

All these features are already included, and I have even more ambitious plans, but I can’t move as quickly as I’d like. **I still have a full-time job to manage.** However, some ideas for the near future include:

- A way to sync between devices.
- Compiling for Android.
- Improving article extraction.
- Starting a blog with RSS for the Chaski site, where updates can be shared.
- Integration with an LLM (AI) for summarizing and interacting with entries.
- Translations.

More details: <https://chaski.a-chacon.com>

## Looking Ahead

The project might end up dead, like many others I’ve tried to create, or maybe not. But creating it has already been an enjoyable experience. Learning new things is always motivating. Hopefully, I’ll reach a version that’s useful to many, and who knows, **maybe RSS will make a comeback**.

The project is open to contributions, suggestions, and any useful feedback. See you next time!
