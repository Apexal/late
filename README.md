![License](https://img.shields.io/github/license/Apexal/late.svg)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/Apexal/late.svg?color=red)
![GitHub package.json version](https://img.shields.io/github/package-json/v/Apexal/late.svg)
![Dependencies](https://img.shields.io/david/Apexal/late.svg)
![Node](https://img.shields.io/badge/node-%3E%3D%2011.0.0-brightgreen.svg)
![Discord](https://img.shields.io/discord/514854227462324244.svg?label=discord)
![GitHub stars](https://img.shields.io/github/stars/Apexal/late.svg)



# LATE


> Lazy Automatic Time Evaluator

  <img align="right" src="./src/assets/img/sisman.svg" width="150">


#### Links

- [RCOS Project Profile](https://rcos.io/projects/apexal/late/profile)
- [Project Proposal](https://docs.google.com/document/d/19D9do_i9MQvUSwz2oh7kbKlGVwLrpwxIYsgLeVjuQfU/view)
- [RCOS Observatory](https://rcos.io/)
- [Website](https://www.late.work/)

### Overview

**LATE** is a web app that tracks your coursework, keeps you on track with reminders and reports, and connects you with your peers with a database of backwork, course recommendations, and more.

**Goals**

- To provide the user with a clear list of all upcoming assignments and tests.
- To allow users to schedule time in their schedule to study/work.
- To remind users to follow the allocated study/work times through means including notifications, text messages, etc.
- To allow users to collaborate by forming study groups, collecting backwork, combining resources, etc.

**Target Audience**
The target audience is **all** RPI students, especially freshmen.

### Local Setup

Make sure you have [NodeJS](https://nodejs.org/en/download/) installed with version `>= 12.0.0`.

- Clone the repository
- Checkout the `dev` branch with `$ git checkout dev`
- `$ npm install -g @vue/cli`
- `$ npm install`
- Create a `.env` file based on `.env.example` in the root folder with the proper configuration environment variables **TEAM MEMBERS:** Ask Frank for the official `.env` file

To run the project in development mode, you must run the API server in one terminal and the front end hot-reloading server in another terminal:

- `$ sudo npm run fix-watch` (Linux users only, may be required if Vue-cli complains about file watchers)
- `$ npm run frontend` to run the hot-reloading Vue server (in one terminal)
- `$ npm run backend` to run the API server (in another terminal)
- Go to url `http://localhost:8080` (whatever `$ npm run frontend` tells you go to) in your browser

### Running the Docker Container

Make sure you have [Docker](https://docs.docker.com/install/) installed. WSL users should follow this guide to [install Docker on WSL](https://blog.jayway.com/2017/04/19/running-docker-on-bash-on-windows/). Note that the Docker container is not recommended for development use.

- Clone the repository
- Checkout the `dev` branch with `$ git checkout dev`
- Create a `.env` file based on `.env.example` in the root folder with the proper configuration environment variables **TEAM MEMBERS:** Ask Frank for the official `.env` file
- Run LATE with `$ ./docker-run --build`. Subsequent runs only need the `--build` flag when there are changes.
- Go to url `http://localhost:3000` in your browser

## Development
The GitHub repo [wiki](https://github.com/Apexal/late/wiki) contains custom resources on the whole stack LATE uses and how to develop the site.

## License
MIT
