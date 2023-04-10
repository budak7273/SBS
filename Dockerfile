FROM node:alpine

WORKDIR ./

# Copy main configs
COPY .eslintrc ./
COPY .env ./
COPY *.ts ./
COPY *.js ./
COPY *.json ./

# Copy source folder
COPY ./src ./src
COPY ./server ./server
COPY ./public ./public

# create main files
RUN yarn build

CMD yarn start
