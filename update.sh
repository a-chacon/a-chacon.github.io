#!/usr/bin/env bash
git pull origin main

#here should update somthing
cd /home/pi/Projects/a-chacon.github.io

kelvin=$(curl "http://api.openweathermap.org/data/2.5/weather?q=Rancagua,cl&APPID=4bf9816391aa609ab0c9d0f86500eec5" | jq '.main.temp_max')

celcius=$(echo "($kelvin-274.15)"| bc -l)

echo "{'celcius': $celcius}" >> ./_data/temp.json

bundle exec jekyll build

git add .
timestamp=$(date +%c)
git commit -m "run: update $timestamp"

git push origin main
