FROM node:12.19.1-stretch

ADD ./* jitsi-meet

WORKDIR /jitsi-meet

RUN npm install

CMD ./node_modules/webpack-dev-server/bin/webpack-dev-server.js --host 0.0.0.0 --disable-host-check

EXPOSE 8080
