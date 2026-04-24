FROM node:18-alpine
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
USER node
EXPOSE 5006
CMD ["npm", "start"]
