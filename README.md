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

Make sure you have [NodeJS](https://nodejs.org/en/download/) installed with version `>= 11.0.0`.

- Clone the repository
- Checkout the `dev` branch with `$ git checkout dev`
- `$ npm install -g @vue/cli`
- `$ npm install`
- Create a `.env` file based on `.env.example` in the root folder with the proper configuration environment variables **TEAM MEMBERS: ** Ask Frank for the official `.env` file

To run the project in development mode, you must run the API server in one terminal and the front end hot-reloading server in another terminal:

- `$ npm run frontend` to run the hot-reloading Vue server (in one terminal)
- `$ npm run backend` to run the API server (in another terminal)
- Go to url `http://localhost:8080` (whatever `$ npm run frontend` tells you go to) in your browser

#### Overview
Easily access daily classes and work blocks, pressing assignments, upcoming exams, and To-Do List:
![alt text](https://github.com/Apexal/late/blob/dev/public/Day_Overview_README.png "Daily Agenda")

Add and edit work blocks via the Dashboard:
![alt text](https://github.com/Apexal/late/blob/dev/public/Dashboard_README.png =600x300 "Dashboard")

Conveniently view assignments for the near future:
![alt text](https://github.com/Apexal/late/blob/dev/public/Upcoming_assignments_README.png =600x300 "Upcoming Assignments")

Seamlessly integrate SMS/email reminders:
![alt text](https://github.com/Apexal/late/blob/dev/public/Notification_Preferences_README.png  =250x250 "Notification Preferences")
