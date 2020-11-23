FROM node:14.11.0-stretch

EXPOSE 80

# WORKDIR /mnt
WORKDIR /usr/home/backend
COPY . .
RUN npm install
CMD ["npm", "run", "start_dev"]