FROM node:18.16-alpine

WORKDIR /usr/src/app


#Install dependencies
COPY package*.json ./
RUN npm install


# Bundle app source
COPY ./dist ./

CMD ["npm", "start"]