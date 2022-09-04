
bundle exec jekyll build

git add .
timestamp=$(date +%c)
git commit -m "feat: update $timestamp"
git push origin main
