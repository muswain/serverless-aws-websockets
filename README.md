# Serverless - AWS Web Sockets

AWS Web Sockets
This uses `serverless-offline` plugin for running websockets locally and AWS SDKv3

## Installation/deployment instructions

Depending on your preferred package manager, follow the instructions below to deploy your project.

> **Requirements**: NodeJS `lts/fermium (v.14.15.0)`. If you're using [nvm](https://github.com/nvm-sh/nvm), run `nvm use` to ensure you're using the same Node version in local and in your lambda's runtime.

### Using NPM

- Run `npm i` to install the project dependencies
- Run `npx sls deploy` to deploy this stack to AWS

### Locally

- `npm run start` - This should start the serverless-offline websocket endpoint on port `3001`
- Once the server is started, you can use any websocket client to connect on `http://localhost:3001`.
- For chrome browser, can use Websocket King Client add-on for adding multiple client connections
- Once multiple clients are connected, pass a payload

```json
{
  "action": "$broadcast",
  "message": "hello everyone"
}
```

- This should broadcast the message `hello everyone` to all the connected clients

### Project structure

The project code base is mainly located within the `src` folder. This folder is divided in:

- `functions` - containing code base and configuration for your lambda functions

```
.
├── resources
|   ├── functions.yml
|   ├── dynamodb.yml
├── src
│   ├── functions            # Lambda configuration and source code folder
│   │   ├── connection-handler.ts
├── package.json
├── serverless.yml           # Serverless service file
├── tsconfig.json            # Typescript compiler configuration
└── webpack.config.js        # Webpack configuration
```
