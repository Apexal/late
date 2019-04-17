# LATE

> Lazy Automatic Time Evaluator

#### Links

- [RCOS Project Profile](https://rcos.io/projects/apexal/late/profile)
- [Project Proposal](https://docs.google.com/document/d/1bq5DBvEQhnIkPUz-keMvDHq_dEQ21vwJqSUVB9zdSYk/edit)
- [RCOS Observatory](https://rcos.io/)

### Overview

**LATE** is a web app that automatically distributes your homework/study time for you based on your calendar while also adapting if you fall off schedule.

**Goals**

- To provide the user with a clear list of all upcoming assignments and tests.
- To automatically allocate free time in a user’s calendar to work on/study for assignments/tests.
- To remind users to follow the allocated study/work times through means including notifications, text messages, etc.
- To account for missing scheduled work by reallocating work times

**Target Audience**
The target audience is college students who use tools such as Google Calendar to track their daily schedules.

### Local Setup

#### Docker Container

Make sure you have [Docker](https://docs.docker.com/install/) installed. WSL users should follow this guide to [install Docker on WSL](https://blog.jayway.com/2017/04/19/running-docker-on-bash-on-windows/).

- Clone the repository
- Checkout the `dev` branch with `$ git checkout dev`
- Create a `.env` file based on `.env.example` in the root folder with the proper configuration environment variables **TEAM MEMBERS:** Ask Frank for the official `.env` file
- Run LATE with `$ ./run-hot-docker`. If you need to update backend files, pass `--build` to the command.
- Go to url `http://localhost:8080` in your browser

#### Manual Install

Make sure you have [NodeJS](https://nodejs.org/en/download/) installed with version `>= 11.0.0`.

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

#### Overview
Easily access daily classes and work blocks, pressing assignments, upcoming exams, and To-Do List:<br/>
<img src="https://github.com/Apexal/late/blob/dev/public/Day_Overview_README.png" width="250" height="380">

Add and edit work blocks via the Dashboard:<br/>
<img src="https://github.com/Apexal/late/blob/dev/public/Dashboard_README.png" width="600" height="300">

Conveniently view assignments for the near future:<br/>
<img src="https://github.com/Apexal/late/blob/dev/public/Upcoming_assignments_README.png" width="600" height="300">

Seamlessly integrate SMS/email reminders:<br/>
<img src= "https://github.com/Apexal/late/blob/dev/public/Notification_Preferences_README.png" width="250" height="250">
