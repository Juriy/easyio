# EASYIO
A simple application to test REST and SocketIO connectivity and experiment with node.js deployement models. This is an accompanying app 
for YouTube series - **"Deploying Node"** https://www.youtube.com/playlist?list=PLQlWzK5tU-gDyxC1JTpyC2avvJlt3hrIh

Check out the deployed version at https://nanogram.io


# Building locally

```
npm install
npm start
```

# Running application
easyio accepts argments, each of which is optional. Below are the arguments with their default values:

`node main.js --name default --port 8080`

`name` - the name that this node will report in API (useful for load-balancing checks)

`port` - port to listen to (host is hardcoded to 127.0.0.1)

To run with PM2 (example with two instances on different ports to match with `conf/nginx/load-balancing.conf` configuration)

```
pm2 start --name easy-1 main.js -- --name easy-1 --port 8080
pm2 start --name easy-2 main.js -- --name easy-2 --port 8081
```

# Project Structure
The node.js app contains only one file - `main.js`. There are some static files to present a (reasonably awkward) 
UI in `public` folder.

NGINX configs are in `conf/nginx` folder

# API
An application exposes REST and SocketIO APIs

## REST API

`GET /api/test ` - dumps request headers as well as remote IP as seen by node.js app (good to test if proxy passes the IP)

`GET /api/name ` - responds with the node name (see command line parameters above)

`GET /api/info ` - responds with app version, reading it from `version.txt` file or 0 if no file is present, value of `__dirname` and `process.cwd()`. Useful to see which version is being served and where is it served from

## SocketIO API
For every connected client, an application listens to `heartbeat` event. Once event is received, server will send back `heartbeat` event with the same payload as client sent, adding the name of the node that processed event. Useful to test socket.io connectivity as well as roundtrip times.


