#!/bin/bash

PROJECT_LOCATION="$HOME/gamedev/easyio"
DIST_NAME="easyio"
TEMP_LOCATION="$HOME/temp"
REMOTE_CONNECTION="game.juriy.com"

echo "Cleaning up old release"
rm -rf $TEMP_LOCATION/$DIST_NAME

echo "Copying code to $TEMP_LOCATION/$DIST_NAME"
cp -r $PROJECT_LOCATION $TEMP_LOCATION/$DIST_NAME

echo "Deleting non-production files"
#rm -rf $TEMP_LOCATION/.git 
#rm -rf $TEMP_LOCATION/ansible 
#rm -rf $TEMP_LOCATION/server/sandbox 
#rm -rf $TEMP_LOCATION/server/test
#rm -rf $TEMP_LOCATION/server/.idea

echo "Compressing..."
tar czfC $DIST_NAME.tar.gz $TEMP_LOCATION $DIST_NAME

echo "Uploading to remote"
scp $DIST_NAME.tar.gz $REMOTE_CONNECTION:~/

ssh $REMOTE_CONNECTION <<'ENDSSH'
echo $DIST_NAME > debug.txt
rm -rf easyio
tar xzf easyio.tar.gz
ENDSSH

echo "Upload and extraction done"
rm $DIST_NAME.tar.gz