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

Make sure you have [NodeJS](https://nodejs.org/en/download/) installed with version `>= 10.0.0`.

- Clone the repository
- If you want to use a specific branch, switch to it with `$ git checkout branch_name`
- `$ npm install`
- `$ npm run dev`
- Go to url `http://localhost:3000` in your browser

To run master branch as of 11/13:
- Switch to it and update by pulling and npm installing
- Make sure that you have .env file at base directory
- `$ source .env`
- `$ npm run dev` (this is for linux users, windows is a little different)
- Go to url `http://localhost:3000` in your browser


Whats in .env?

export CAS_SERVICE_URL=http://localhost:3000
export HOST=0.0.0.0
export PORT=3000
export MONGODB_URI=mongodb://webapp:gDP6VttbUwDYu9P@ds041861.mlab.com:41861/late-dev
export API_BASE_URL=http://localhost:3000/api/
export SENDGRID_API_KEY=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


