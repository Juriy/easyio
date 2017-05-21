#!/bin/bash

tar czf easyio.tar.gz main.js package.json yarn.lock public LICENSE
scp easyio.tar.gz nanogram.io:~
rm easyio.tar.gz

ssh nanogram.io << 'ENDSSH'
pm2 stop all
rm -rf easyio
mkdir easyio
tar xf easyio.tar.gz -C easyio
rm easyio.tar.gz
cd easyio 
yarn install
pm2 start all
ENDSSH
