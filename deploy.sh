#!/bin/bash

tar czf easyio.tar.gz main.js package.json yarn.lock public LICENSE
scp easyio.tar.gz 188.166.227.208:~
rm easyio.tar.gz

ssh 188.166.227.208 << 'ENDSSH'
pm2 stop easyio
rm -rf easyio
mkdir easyio
tar xf easyio.tar.gz -C easyio
rm easyio.tar.gz
cd easyio 
yarn install
pm2 start easyio
ENDSSH
