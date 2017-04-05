#!/bin/bash

tar czf easyio.tar.gz main.js package.json yarn.lock public LICENSE
scp easyio.tar.gz 45.76.152.89:~
rm easyio.tar.gz

ssh 45.76.152.89 << 'ENDSSH'
pm2 stop easyio
rm -rf easyio
mkdir easyio
tar xf easyio.tar.gz -C easyio
rm easyio.tar.gz
cd easyio 
yarn install
pm2 start easyio
ENDSSH
