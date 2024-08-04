---
layout: post
title: Automate Your Ruby Gem Releases
categories:
  - RubyGem
excerpt: >-
  Discover how to automate the releases and publication of your gems on RubyGems
  using release-please and GitHub Actions.
image: /assets/images/ruby.webp
author: Andrés
comments: true
---
A few days ago, I launched [OasRails](https://github.com/a-chacon/oas_rails), a Rails engine for generating **interactive documentation** and simplifying your **APIs**. A Rails engine is a gem, and as such, it needs to be packaged and uploaded to a gem hosting service, in this case, [RubyGems](https://rubygems.org/). I found myself needing to automate the release process, which is how I came across [release-please](https://github.com/googleapis/release-please).

Release Please, as its repository states, is a tool for automating **CHANGELOG generation**, **GitHub releases**, and **version bumps** for your projects. The best way to run Release Please is through [GitHub Actions](https://docs.github.com/en/actions).

**Why this blog post if there are already several?** The truth is, I didn’t find any that discuss how to configure version 4 of Release Please.

With that said, here are the steps to follow:

1. Create the file defining the workflow at `.github/workflows/release-please.yml` and add the following inside the file:

   ```yml
   on:
     push:
       branches:
         - main

   permissions:
     contents: write
     pull-requests: write
     id-token: write

   name: release-please

   jobs:
     release-please:
       runs-on: ubuntu-latest
       steps:
         - uses: googleapis/release-please-action@v4
           id: release
           with:
             token: ${{ secrets.RELEASE_PLEASE_TOKEN }}
             config-file: .release-please-config.json
         - uses: actions/checkout@v4
           if: ${{ steps.release.outputs.release_created }}
         - name: Set up Ruby
           uses: ruby/setup-ruby@v1
           with:
             bundler-cache: true
           if: ${{ steps.release.outputs.release_created }}
         - uses: rubygems/release-gem@v1
           if: ${{ steps.release.outputs.release_created }}
   ```

   Choose your **main branch** from which you want to make the releases. Then, to make this work, we need to follow these steps, so wait and don't commit yet.

2. Create a **secret** in your repository named `RELEASE_PLEASE_TOKEN` or whatever you prefer, just make sure to update the name defined in the previous file. If you don't know how to add a secret, [here's a guide.](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

3. Enable the option for **GitHub Actions** to create **PRs** in your repository. You do this in **Settings -> Actions -> General** and enable the option that says something like: Allow GitHub Actions to create and approve **pull requests**.

   ![Example of where to find the configuration to allow GitHub Actions to create PR](https://jhale.dev/assets/img/posts/auto_merging_prs/org_actions_prs_permissions.png)

4. Release Please handles documenting the release, but publishing the gem on **RubyGems** is done by the [rubygems/release-gem](https://github.com/rubygems/release-gem) action. To enable this, you need to add it to [Trusted Publishing](https://guides.rubygems.org/trusted-publishing/).

5. Finally, the configuration files that Release Please needs and that you should add to the root of your repository:

   - `.release-please-config.json` with content like the following:

   ```yml
   {
     "release-type": "ruby",
     "packages":
       {
         ".":
           {
             "release-type": "ruby",
             "package-name": "YOUR RUBY GEM NAME",
             "version-file": "lib/YOUR RUBY GEM NAME/version.rb",
           },
       },
   }
   ```

   - `.release-please-manifest.json` with the version of your gem:

   ```yml
   { ".": "0.3.0" }
   ```

**I recommend reading the official documentation for each tool used in the process.**

Release Please follows the guidelines of [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to create your changelog and determine when to bump the version, so you should follow this convention to ensure everything works correctly.

With these simple steps, you can achieve an **automatic release**, where the only thing you'll need to do is approve the PR when you consider it ready. The process will be: The workflow runs once and generates a PR; if it already exists, it updates it. The second step involves approving the PR, which will trigger the second part of the workflow, the gem publishing. And with that, the process is complete.

I hope this helps. For me, it was a full day of research to get it working, as the posts I found used version 2 and the gem publishing was less secure. But it was worth it; the process becomes quite simple, allowing you to make the releases you need without worrying about maintaining the changelog or building the gem for publication.

