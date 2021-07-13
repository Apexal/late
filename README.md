# No Longer Maintained
Just use Google Calendar... Jokes aside, I was blessed to mentor and work with all the amazing RCOS contributors to LATE over the years. I appreciate you all and I hope you had a good time and learned a thing or two in the end, as I certainly did. In retrospect, working with everyone was easily the most fulfilling part of this project. However, now that I'm closing out my academic career soon I can't justify further investing time and effort into anything related to coursework! I'll keep this repository as a testament to all the work that was done and hopefully inspire future student developers :)


---

![License](https://img.shields.io/github/license/Apexal/late.svg)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/Apexal/late.svg?color=red)
![GitHub package.json version](https://img.shields.io/github/package-json/v/Apexal/late.svg)
![Dependencies](https://img.shields.io/david/Apexal/late.svg)
![Node](https://img.shields.io/badge/node-%3E%3D%2011.0.0-brightgreen.svg)
![Discord](https://img.shields.io/discord/514854227462324244.svg?label=discord)
![GitHub stars](https://img.shields.io/github/stars/Apexal/late.svg)



# LATE


> Better LATE than never!

  <img align="right" src="./src/assets/img/sisman.svg" width="150">


#### Links

- [RCOS Project Profile](https://rcos.io/projects/apexal/late/profile)
- [Project Proposal](https://docs.google.com/document/d/19D9do_i9MQvUSwz2oh7kbKlGVwLrpwxIYsgLeVjuQfU/view)
- [RCOS Observatory](https://rcos.io/)
- [Website](https://www.late.work/)

### Overview

**LATE** is a web app that tracks your coursework and keeps you on track with reminders and reports.

**Goals**

- To provide the user with a clear list of all upcoming assignments and tests.
- To allow users to schedule time in their schedule to study/work.
- To remind users to follow the allocated study/work times through means including notifications, text messages, etc.

**Target Audience**
The target audience is **all** RPI students, especially freshmen.

### Local Setup

Make sure you have [NodeJS](https://nodejs.org/en/download/) installed with version `>= 14.0.0`.

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

## Development
The GitHub repo [wiki](https://github.com/Apexal/late/wiki) contains custom resources on the whole stack LATE uses and how to develop the site.

## License
MIT
