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

EXPOSE 8080

# increasing file watchers must be made as root
# USER node

CMD ["npm", "start"]
