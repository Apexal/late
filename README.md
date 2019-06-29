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
- [Project Proposal](https://docs.google.com/document/d/1bq5DBvEQhnIkPUz-keMvDHq_dEQ21vwJqSUVB9zdSYk/edit)
- [RCOS Observatory](https://rcos.io/)
- [Website](https://www.late.work/)

### Overview

**LATE** is a web app that tracks and automatically distributes your homework/study time based on your calendar while also adapting if you fall off schedule.

**Goals**

- To provide the user with a clear list of all upcoming assignments and tests.
- To automatically use free time in a user’s calendar to work on/study for assignments/tests.
- To remind users to follow the allocated study/work times through means including notifications, text messages, etc.
- To account for missing scheduled work by reallocating work times

**Target Audience**
The target audience is college students who use tools such as Google Calendar to track their daily schedules.

### Local Setup

Make sure you have [NodeJS](https://nodejs.org/en/download/) installed with version `>= 11.0.0`.

- Clone the repository
- Checkout the `dev` branch with `$ git checkout dev`
- `$ npm install -g @vue/cli`
- `$ npm install`
- Create a `.env` file based on `.env.example` in the root folder with the proper configuration environment variables **TEAM MEMBERS:** Ask Frank for the official `.env` file

To run the project in development mode, you must run the API server in one terminal and the front end hot-reloading server in another terminal:

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

## License
MIT
