FROM ubuntu:24.10 AS builder

# Install any needed packages
RUN apt-get update && apt-get install -y curl git gnupg

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs build-essential sed

WORKDIR /apps
COPY . .

RUN npm install -g yarn
RUN yarn && NODE_ENV=production yarn build

CMD ["ls", "-al", "build"]

# ===========================================================
FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /apps/public /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
