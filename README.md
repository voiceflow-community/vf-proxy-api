# dialog-proxy-api

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run ./src/app.js
```

# VF Proxy API

This is a Bun application that serves as a proxy to use Voiceflow Dialog API and update agent's variables on client side. The application uses fastify for server/routes setup.
The main goal is to provide an endpoint you can use from the client side (webpage, chat widget script) without sharing your Voiceflow API key.

## Setup

1. Clone this repository:

```bash
git clone https://github.com/your-repo/.git
cd vf-proxy-api
```

2. Install Bun and dependencies:

```bash
curl -fsSL https://bun.sh/install | bash
bun install
```

3. Copy the `.env.template` file or create a new `.env` file:

```bash
cp .env.template .env
```

4. Edit the `.env` file with your own Voiceflow API keys, as well as any other configurations you want to modify.

## Environment Variables

The application uses the following environment variables which are stored in a `.env` file:

- `VOICEFLOW_API_KEY`: Voiceflow API Key
- `VOICEFLOW_ENDPOINT`: https://general-runtime.voiceflow.com # Default DM API Endpoint
- `LOGGER`: true (to enable logging) or false
- `RATE_LIMIT`: Number of request per time window
- `RATE_LIMIT_WINDOW`: Time window in seconds
- `RETURN_RESPONSE`: true to return the response from the Voiceflow API, false to return only status code (without the variables values)
- `PORT`: Port to run the server on


## Usage

### Run/Test locally

When the app is not running with PM2, it will start an interactive prompt where you can update the KB or exit the app. If you choose to update the KB, it will ask for your KB API key, project ID, sitemap URL, whether to force the update and the number of previous days to check for last modification date.
Run the application in interactive mode:

```bash
bun run app
```

### Docker

To simply the process, we are providing the Dockerfile and docker-compose file to build the Bun image and run the application.

```bash
bun run docker-start
```

### API Endpoints

- `GET /api/health`: Used to check if the server is running (healthcheck)

- `PATCH /api/variables/:userID`: Patch the variables from the body payload for the given userID

  Body payload example:

  ```json
  {
    "variable_name": "voiceflow",
    "username": "Niko"
  }
  ```

  Variables should already exist in your Voiceflow agent to be succefuly updated.


## Video Tutorial

[![Video Tutorial](https://img.youtube.com/vi/NaeWfDCNmMM/0.jpg)](https://youtu.be/NaeWfDCNmMM)


## Voiceflow Discord

We can talk about this project on Discord
https://discord.gg/9JRv5buT39

