FROM node:11

# set up environment
WORKDIR /usr/src/app
ENV NPM_CONFIG_PREFIX=/home/node/.npm_global

# install project dependencies
RUN npm install -g @vue/cli
COPY package.json package-lock.json ./
RUN npm install

# update project sources
COPY . .
RUN npm run build
# useful to do setup as root, but run as node
# must create the logs directory as root
RUN mkdir logs

EXPOSE 3000

USER node

CMD ["npm", "start"]
