#!/bin/bash

tar czf easyio.tar.gz main.js package.json public LICENSE
scp easyio.tar.gz nanogram@nanogram.io:~
rm easyio.tar.gz

ssh nanogram@nanogram.io << 'ENDSSH'
pm2 stop all
rm -rf easyio
mkdir easyio
tar xf easyio.tar.gz -C easyio
rm easyio.tar.gz
cd easyio 
npm i
pm2 start all
ENDSSH
