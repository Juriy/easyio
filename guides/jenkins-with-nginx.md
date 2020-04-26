# Configuring Jenknins behind NGINX reverse proxy

This guide covers setting up NGINX to be a reverse proxy in front of Jenkins CI 
server. It assumes that you have CentOS server with Java and Jenkins already
installed and configured

## Before you start
Make sure that you have epel-release installed:

```
> yum -y install epel-release
```

## Install NGINX

```
# install nginx
> yum -y install nginx

# start nginx automatically on system restart
> systemctl enable nginx

# allow nginx to connect to connect to other services
> setsebool -P httpd_can_network_connect on
```

## Install certbot
```
# install certbot
> yum -y install certbot
```
**Before next step make sure that nginx or other web server is not running**

```
# request a certificate
> certbot certonly --standalone -d build.nanogram.io
```

## Add nginx configuration

The full config file can be found in `conf/nginx/jenkins.conf`, this 
guide shows the highlights of the configuration

The configuration should go to `/etc/nginx/conf.d` on the server

```

# configure upstream
upstream jenkins {
    server localhost:8080;

    # limit the number of idle connections to this upstream
    keepalive 16;
}

server {
    ...
    # standard "redirect-all-to-https" configuration
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name  build.nanogram.io;

    # root directive is not needed here, 
    # since all traffic is redirected to Jenkins and
    # it will be serving static files
    
    # standard long block of SSL configuration is omitted, 
    # check the full file for details 
    ....

    # Jenkins will use custom headers for CSRF protection
    # whithout this directive NGINX will drop those headers
    ignore_invalid_headers off;

    location / {
        proxy_pass http://jenkins;

        # we want to connect to Jenkins via HTTP 1.1 with keep-alive connections
        proxy_http_version 1.1;

        # has to be copied from server block, 
        # since we are defining per-location headers, and in 
        # this case server headers are ignored
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # no Connection header means keep-alive
        proxy_set_header Connection "";

        # Jenkins will use this header to tell if the connection
        # was made via http or https
        proxy_set_header X-Forwarded-Proto $scheme;

        # increase body size (default is 1mb)
        client_max_body_size       10m;

        # increase buffer size, not sure how this impacts Jenkins, but it is recommended
        # by official guide
        client_body_buffer_size    128k;

        # block below is for HTTP CLI commands in Jenkins
        
        # increase timeouts for long-running CLI commands (default is 60s)
        proxy_connect_timeout      90;
        proxy_send_timeout         90;
        proxy_read_timeout         90;

        # disable buffering
        proxy_buffering            off;
        proxy_request_buffering    off; 
    }

    error_page 404 /404.html;
        location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
        location = /50x.html {
    }
}

```

# Start NGINX
Once config is deployed on the server, start NGINX:
```
> systemctl start nginx
```

Jenkins should now be served through https://<jenkins-host>/

# Configure Jenkins
Jenkins will show red banner "reverse proxy is not configured properly", 
at this stage it is OK (we'll get rid of it on the next step). 
In Jenkins, go to `Manage Jenkins > Configure System`, find `Jenkins URL` 
change from the default value to `https://<jenkins-host>/` (your address
that NGINX is listening to).

Open Jenkins config file `/etc/sysconfig/jenkins` find the following line and
update the address to 127.0.0.1, so that Jenkins is not accepting connections
from outside:

```
JENKINS_LISTEN_ADDRESS="127.0.0.1"
```

Restart Jenkins to apply this change:

```
> systemctl restart jenkins
```

# Links

NGINX config guide from Jenkins Wiki: 
https://wiki.jenkins.io/display/JENKINS/Running+Jenkins+behind+Nginx

Jenkins guide to solve "Reverse proxy setup is broken" 
https://wiki.jenkins.io/display/JENKINS/Jenkins+says+my+reverse+proxy+setup+is+broken

MDN on HTTP connection management:
https://developer.mozilla.org/en-US/docs/Web/HTTP/Connection_management_in_HTTP_1.x

`proxy_set_header` - documentation explains inheritance from "server" block and 
when directives are ignored
http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_set_header

`proxy_http_version` http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_http_version