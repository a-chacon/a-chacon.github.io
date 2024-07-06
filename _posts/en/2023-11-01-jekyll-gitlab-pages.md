---
layout: post
title: 'Create Your Free Web Site: Jekyll and GitLab Pages Make It Possible'
categories:
  - Jekyll
excerpt: >-
  Discover how to set up your own website at no cost using Jekyll and GitLab
  Pages.
image: /assets/images/gitlabpages.jpg
lang: en
time: 5 min
author: Andrés
comments: true
redirect_from:
  - /web/jekyll/2023/11/01/jekyll-gitlab-pages.html
---
This post aims to show how to deploy your Jekyll site in GitLab Pages. It is a continuation of the previous version, [Create Your Free Website: Jekyll and GitHub Pages Make It Possible](/web/jekyll/2023/10/02/make-your-wersite-with-jekyll-githubpages.html). If you haven't had a chance to review the above steps, we recommend you do so before continuing. You can then go back and follow these steps to deploy your site on GitLab Pages. This platform offers the advantage of allowing you to keep your repositories private while your website remains public, an option that on GitHub is only available on Enterprise accounts.

So moving on to our `mysite` project:

## 1. GitLab CI

You will need to create a file in the root of your project called `.gitlab-ci.yml` and add the following content:

```yaml
image: ruby:3.2.2

workflow:
  rules:
    - if: $CI_COMMIT_BRANCH

cache:
  paths:
    - vendor/

before_script:
  - gem install bundler
  - bundle install --path vendor

pages:
  stage: deploy
  script:
    - bundle exec jekyll build -d public
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  environment: production

test:
  stage: test
  script:
    - bundle exec jekyll build -d test
  artifacts:
    paths:
      - test
  rules:
    - if: $CI_COMMIT_BRANCH != "main"
```

# GitLab

If you already have a GitLab account then fine, if not you can create one [here](https://gitlab.com/users/sign_up)

## Repository

We hit create a new project, then `Create a blank project`:

![New project in gitlab](/assets/images/gitlab_new_project.png).

**Uncheck the option initialize with a README**.

We complete the rest of the form and click on create.

Then we will follow the steps that are indicated in the section `Push an existing Git repository`, in my case they would be the following ones:

```
cd mysite
git remote rename origin old-origin
git remote add origin git@gitlab.com:a-chacon/mysite.git
git push --set-upstream origin --all
git push --set-upstream origin --tags
```

**Don't forget to commit the .gitlab-ci.yml file we created in the previous steps**.

After our push we will be able to see our first Job running.

![Gitlab pages jobs](/assets/images/gitlab_pages_jobs.png)

## Pages

When the Job finishes, you can go in the right side section of your repository to the `Deploy` tab and select `Pages` to find the url that GitLab Pages assigned to your project:

![Gitlab pages url](/assets/images/gitlab_pages.png)

## Visibility

If you created your repository as `private` you will need to adjust the visibility of your page so that it can be seen by everyone following the instructions given by gitlab:

> To make your website available to the public, go to Project Settings > General > Visibility and select Everyone in the se

