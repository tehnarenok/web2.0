FROM nginx:alpine

COPY src /var/usr/static
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
