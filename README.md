# findy-common-ts

[![test](https://github.com/findy-network/findy-common-ts/actions/workflows/test.yml/badge.svg?branch=dev)](https://github.com/findy-network/findy-common-ts/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/findy-network/findy-common-ts/branch/dev/graph/badge.svg?token=IHRO30DGIE)](https://codecov.io/gh/findy-network/findy-common-ts)

> Findy Agency is an open-source project for a decentralized identity agency.
> OP Lab developed it from 2019 to 2024. The project is no longer maintained,
> but the work will continue with new goals and a new mission.
> Follow [the blog](https://findy-network.github.io/blog/) for updates.

## Getting Started

Findy Agency is a collection of services ([Core](https://github.com/findy-network/findy-agent),
[Auth](https://github.com/findy-network/findy-agent-auth),
[Vault](https://github.com/findy-network/findy-agent-vault) and
[Web Wallet](https://github.com/findy-network/findy-wallet-pwa)) that provide
full SSI agency along with a web wallet for individuals.
To start experimenting with Findy Agency we recommend you to start with
[the documentation](https://findy-network.github.io/) and
[set up the agency to your localhost environment](https://github.com/findy-network/findy-wallet-pwa/tree/dev/tools/env#agency-setup-for-local-development).

- [Documentation](https://findy-network.github.io/)
- [Instructions for starting agency in Docker containers](https://github.com/findy-network/findy-wallet-pwa/tree/dev/tools/env#agency-setup-for-local-development)

## Project

Module that provides common findy-agent usage functionality.

## Description

This library provides utilities for connecting to Findy Agency from a Node.js-application.
It provides

- means to authenticate to agency using [findy auth services](https://github.com/findy-network/findy-agent-auth)
- helpers for opening and making [the gRPC API](https://github.com/findy-network/findy-agent-api) calls
- TS code generated from gRPC API proto file

The focus is to provide utilities especially long-running webapps that intend to issue and verify credentials.

## Usage

1. Run

   ```sh
   npm install @findy-network/findy-common-ts
   ```

1. Either use cloud agency installation or [setup agency to your local environment](https://github.com/findy-network/findy-wallet-pwa/blob/master/tools/env/README.md#agency-setup-for-local-development).
   You need following settings for a successful connection (_defaults for local_):

   - Authentication service URL (_`http://localhost:8088`_)
   - Core agency server address (_`localhost`_)
   - Core agency server port (_`50052`_)
   - Path to core agency TLS cert files (_`/path/to/this/repo/tools/config/cert`_)
   -- unless the certificate is issued by a trusted issuer

1. Check [example](#example) how to authenticate to agency and connect to other agents using the library. More advanced examples can be found in [sample webapp implementation](https://github.com/findy-network/findy-issuer-tool).

## Example

This example shows how to onboard an agent to Findy agency, create invitation and send a basic message to the new connection once the connection is established.

For more examples, check [e2e tests](./e2e) or sample webapp implementation: [issuer-tool](https://github.com/findy-network/findy-issuer-tool).

```ts
import {
  createAcator,
  openGRPCConnection,
  agencyv1
} from '@findy-network/findy-common-ts';

const start = async (): Promise<void> => {
  const authUrl = 'http://localhost:8088';
  const userName = `my-chat-bot`;
  // Authenticator key - should be kept secret
  const key =
    '15308490f1e4026284594dd08d31291bc8ef2aeac730d0daf6ff87bb92d4336c';
  const serverAddress = 'localhost';
  const serverPort = 50052;
  const certPath = './tools/config/cert';

  // Create authenticator.
  // Authenticator onboards the agent automatically if this is the first time
  // we are connecting to auth service.
  const acatorProps = {
    authUrl,
    userName,
    key
  };
  const authenticator = createAcator(acatorProps);

  // Open gRPC connection to core agency
  const grpcProps = {
    serverAddress,
    serverPort,
    certPath
  };

  const connection = await openGRPCConnection(grpcProps, authenticator);
  const { createAgentClient, createProtocolClient } = connection;
  const agentClient = await createAgentClient();
  const protocolClient = await createProtocolClient();

  // Start listening to agent notifications
  const options = {
    protocolClient: protocolClient
  };
  await agentClient.startListeningWithHandler({
    DIDExchangeDone: (info, data) => {
      // connection established, send message to new connection
      const connectionId = info.connectionId;
      const basicMsg = new agencyv1.Protocol.BasicMessageMsg();
      basicMsg.setContent('Hello world');

      protocolClient.sendBasicMessage(connectionId, basicMsg);
    }
  }, options);

  // Create invitation. Copy the invitation from the console and use it to connect e.g.
  // with web wallet user.
  const invMsg = new agencyv1.InvitationBase();
  invMsg.setLabel(userName);
  const invResult = await agentClient.createInvitation(invMsg);
  console.log(
    'Connect using this invitation and I will greet you!',
    invResult.getJson()
  );
};
```

## Development

1. Install typescript

   ```bash
   npm install -g typescript
   ```

1. Install deps

   ```bash
   npm install
   ```

1. Run unit test

   ```bash
   npm test
   ```

1. Run e2e test

   ```bash
   npm run e2e
   ```
