FROM node:12.19.1-stretch

COPY ./* jitsi-web/

WORKDIR jitsi-web

RUN npm install

CMD ["./node_modules/webpack-dev-server/bin/webpack-dev-server.js", "--host 0.0.0.0", "--disable-host-check"]

EXPOSE 8080
