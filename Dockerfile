# Backend
FROM node:18-bullseye AS backend-base

RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y msodbcsql17

# Workaround for npm running in random uid to write in cache folder
USER node

RUN npm cache verify && \
    npm config set logs-max 0

USER root

RUN chown -R node:0 /home/node/.npm && \
    chmod -R 660 /home/node/.npm && \
    chmod -R +X /home/node/.npm && \
    chown node:0 /home/node/.npmrc && \
    chmod 660 /home/node/.npmrc


FROM backend-base AS backend

RUN mkdir /home/node/src-backend && \
    chown node:node /home/node/src-backend && \
    chmod 755 /home/node/src-backend

WORKDIR /home/node/src-backend

COPY --chown=node:node ["backend/", "."]

RUN rm -Rf node_modules && \
    rm -Rf public && \
    npm i && \
    npm run build

RUN mkdir public

# Frontend
FROM node:18-buster AS ui

RUN mkdir /home/node/src-ui && \
    chown node:node /home/node/src-ui && \
    chmod 755 /home/node/src-ui

WORKDIR /home/node/src-ui

COPY --chown=node:node ["frontend/", "."]

RUN rm -Rf node_modules && \
    npm ci --legacy-peer-deps && \
    INLINE_RUNTIME_CHUNK=false npm run build

EXPOSE 3000



FROM backend-base

USER root

ENV TZ=Asia/Hong_Kong
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN sed -i 's/DEFAULT@SECLEVEL=2/DEFAULT@SECLEVEL=1/g' /etc/ssl/openssl.cnf
RUN sed -i 's/TLSv1.2/TLSv1.0/g' /etc/ssl/openssl.cnf

USER node

RUN mkdir /home/node/app && \
    chown node:node /home/node/app && \
    chmod 755 /home/node/app

WORKDIR /home/node/app

COPY --from=backend --chown=node:node ["/home/node/src-backend", "."]
COPY --from=ui --chown=node:node ["/home/node/src-ui/build/", "./src/userapp/public/"]

# Specify a home for the random user created by CRI-O
ENV HOME=/home/node

EXPOSE 8080

CMD [ "npm", "run", "userapp" ]
