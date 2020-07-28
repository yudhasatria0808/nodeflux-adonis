# This file is a template, and might need editing before it works on your project.
FROM node:12.16.2-alpine3.11

# Copy depedency
ADD package*.json /usr/src/app/

# Create app directory
WORKDIR /usr/src/app

# To handle 'not get uid/gid'
# RUN npm config set unsafe-perm true

# Install depedency
RUN npm install
RUN npm i -g @adonisjs/cli

COPY . .

# RUN adonis migration:run

# Run application
CMD [ "adonis", "serve" ]
