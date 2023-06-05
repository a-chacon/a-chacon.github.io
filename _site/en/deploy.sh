sudo docker container stop a-chacon
sudo docker container rm a-chacon
sudo docker image rm a-chacon
sudo docker build -t a-chacon .
sudo docker run -d --restart always --name a-chacon -p 5000:4000 a-chacon

