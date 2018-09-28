# CLI for Dao.Casino SDK

![](https://img.shields.io/npm/dt/dc-cli.svg)
![](https://img.shields.io/npm/v/dc-cli.svg)

# Overview

DC-CLI is a command line wizard designed to smoothly download and deploy [DAO.Casino SDK](https://github.com/DaoCasino/SDK) elements. The idea behind it is to reduce the number of similar manual operations (e.g. changing the same value at several points) and, subsequently, to reduce the risk of errors.

![](https://github.com/DaoCasino/SDK/wiki/green_flag.png)[**SDK Documentation**](https://dc-cli.firebaseapp.com/#)

Thus, whenever the game contract conditions (configuration values) are edited, the [watch_contracts.js](https://github.com/DaoCasino/SDK/blob/master/scripts/watch_contracts.js) script designed to monitor contract status implements your updates environment-wide and redeploys the contract.

# Prerequisites:
To use dc-cli, you need:
* [docker-compose](https://docs.docker.com/compose/install/)
* one of the recent [node.js](https://nodejs.org/en/download/) versions (10 or newer)
* Bash Terminal (if you are using Windows)

A developer is expected to be familiar with solidity to edit the game smart contract.

Note that the whole solution has been successfully tested on .nix OS's and Mac OS. It is supposed to be compatible with Windows, but no tests have been carried out so far. You may need to install additional applications.

# Installation
To install DC-CLI, call:

```js
 npm i -g dc-cli
```

# Commands
dc-cli offers a list (a menu) of commands; each is responsible for a specific stage of SDK setup. There is a recommended order of commands, but it can be revised at developer's discretion, also dc-cli commands can be used separately at further stages of SDK life-cycle (e.g. to reset the environment).

![](https://github.com/DaoCasino/SDK/wiki/dc_cli_menu.jpg)

## List
View the list of available Truffle templates (webpack, Vue, React). Choose one for your project.
## Create
First command is called to pull the SDK container from the docker repository. Call the command and enter the path to folder where you want to deploy your local SDK. 
Then the container is pulled, the local test environment is deployed, smart contracts (`.sol` files) configured, accounts created.
You can access the console in the browser at `localhost:port_number`.

Once complete, call dc-cli again and move to the next command. 

To view logs, either use the relevant dc-cli command, or call:
`npm run `

```js
logs:bankroller
```


## Start
This command starts the SDK browser console with a viable game example in it. 
Use the console to navigate between files, edit game logic.
## Stop
This command stops the environment correctly. If you close the console manually, docker container will go on running in the background.

## Logs

This command allows viewing dapp performance logs. 

## Build
This command compiles your contract settings for ropsten.

## Deploy
This command publishes your contracts to [ropsten](https://ropsten.etherscan.io) and IPFS. 

## Publish
Makes the game available at gamemarket.

Whenever you call a command in dc-cli, you call [package.json](https://github.com/DaoCasino/SDK/blob/master/package.json) file. Acting as a "dashboard", the file, in turn, calls the relevant script to execute the selected command. 

# Console File Structure
The left side of the console window displays the file structure of the SDK environment within the folder where you choose to deploy it. 

Basically, it contains files from Dao.Casino github repositories deployed and integrated on your local computer in way that allows you to immediately start developing games and/or launching your own platform.

The smart contract logic is stored in the **contracts** > **tools** folder. For detailed description of each contract, refer to the relevant section.

The game logic is stored in files within the **dapp** folder. For more details on each file, please refer to [the relevant documentation section](https://github.com/DaoCasino/SDK/wiki/Typical-DApp-File-Structure).

The **dapp**> **config** folder contains the script ensuring implementation of the protocol.

The **test** folder contains the tests that verify whether the protocol from DC.js is correctly implemented into the game logic (the sample game, [DappTest.js](https://github.com/DaoCasino/SDK/blob/master/test/DappTest.js), is used). 

The **view** folder is designed for the game front-end visual elements.

