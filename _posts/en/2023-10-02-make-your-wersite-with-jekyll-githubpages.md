---
layout: post
title: 'Create Your Free Website: Jekyll and GitHub Pages Make It Possible'
categories:
  - Jekyll
excerpt: >-
  Discover how to set up your own website at no cost using Jekyll and GitHub
  Pages.
image: /assets/images/jekyll.png
lang: en
time: 5 min
author: Andrés
comments: true
---
[Jekyll](https://jekyllrb.com/) is a static website generation engine and [GitHub Pages](https://pages.github.com/) is a free hosting service provided by GitHub. By combining these two tools, you can easily create a static website to showcase your projects, blogs or any other content you wish to share.

## Jekyll

### Installing Jekyll

To install jekyll you need Ruby on your computer. You can verify if Ruby is installed by running:

```shell
ruby --version
```

If you don't have Ruby installed, follow the instructions at [ruby-lang.org](https://www.ruby-lang.org/en/documentation/installation/) to install it.

Then install jekyll:

```
gem install jekyll
```

### New project with jekyll

We will create our project with Jekyll using the following command:

```
jekyll new mysite
```

### We will add some content

Jekyll is a static web site generator that converts content written in **Markdown** or **HTML** into pre-compiled static web pages. To understand a little more how it works we will add some content to our `index.markdown` page which is located in the root of our project. Open the file with your favorite editor and add the following content:

```markdown
---
layout: home
---

# This is mysite

I will show you amazings things.

## Hello world

This is an aweson jekyll site created by me.

`def main; end`

A wise man says:

> > To be, or not to be
```

### Let's test our page locally

We run the local server with the following command :

```
bundle exec jekyll serve
```

Then, open your web browser and go to `http://localhost:4000` to see your web site in development. You will notice that our markdown ends up converted to html. To learn more about how jekyll works and what you can achieve I recommend you read the documentation.

## Github

If you already have a GitHub account then you can use that one and if you don't then create a new one.

For GitLab you can see [here](/web/jekyll/2023/11/01/jekyll-gitlab-pages.html).

### New repository

![](/assets/images/newrepogithub.png)

We create a **blank repository** for our project. The name of the repository must be the name of our user in github if we want our site to be in the root of the domain that github gives us. Example: If your username is `luisito123` then your repository should be called `luisito123.github.io`. And the repository must be **public**.

![](/assets/images/reponame.png)

## Add an ssh key

To upload changes to our repository we must add our ssh key on GitHub. For this you can take a look at this [guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent).

### We upload our changes

### For the first time

After creating our project we must initialize the git repository and upload our changes by executing the following commands in the root of our project and taking into account that the url **must be the one of your repository**:

```
git init
git add .
git commit -m "first commit
git branch -M main
git remote add origin https://github.com/{YOUR_ACCOUNT}/{YOUR_ACCOUNT}.github.io.git
git push -u origin main
```

### Then

For a next time you'll just add your changes, commit and push:

```
git add .
git commit -m "A message here!"
git push origin main
```

## Configure the deployment

To get our page published we must configure our repository with github pages.

Select the settings tab of our repository.

![](/assets/images/githubsettings.png)

Then we select Pages.

![](/assets/images/githubpages.png)

And finally in the `branch` section we select our `main` branch and click on save.

![](/assets/images/githubbranch.png)

This should start running the first pipeline which will deploy the code currently in the repository. After a minute or two you should be able to see your site at the url of the same name as your repository, in my case: `m̀ysiteduck.github.io`.

# Last details

As we can see, making your site with Jekyll and deploying it on GitHub pages can be a good option especially if you already know some markdown and versioning with git. This same site also works the same way.

Some tips that may interest you if you will continue working with Jekyll and GitHub Pages:

- [How to set up your domain in github pages](https://docs.github.com/es/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [How to use jekyll-admin to edit your pages using a UI](https://jekyll.github.io/jekyll-admin/)
- [Installing a theme in jekyll](https://jekyllrb.com/docs/themes/)

