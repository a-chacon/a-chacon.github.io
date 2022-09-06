#!/usr/bin/env bash

#here should update somthing
cd /home/pi/Projects/a-chacon.github.io

bundle exec jekyll build

git add .
timestamp=$(date +%c)
git commit -m "run: update $timestamp"

git push origin main
