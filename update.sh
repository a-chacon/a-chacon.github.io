#!/usr/bin/env bash

#here should update somthing

bundle exec jekyll build

git add .
timestamp=$(date +%c)
git commit -m "run: update $timestamp"

git push origin main
