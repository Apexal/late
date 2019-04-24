const STUDY_WORK_DURATION = 25 * 60;
const SHORT_BREAK_DURATION = 5 * 60;
const LONG_BREAK_DURATION = 15 * 60;

const state = {
  initialTime: 25 * 60,
  timer: null,
  totalTime: 5,
  open: true,
  paused: true,
  stageIndex: 0,
  stages: [
    {
      title: 'Study/Work',
      duration: STUDY_WORK_DURATION
    },
    {
      title: 'Short Break',
      duration: SHORT_BREAK_DURATION
    },
    {
      title: 'Study/Work',
      duration: STUDY_WORK_DURATION
    },
    {
      title: 'Short Break',
      duration: SHORT_BREAK_DURATION
    },
    {
      title: 'Study/Work',
      duration: STUDY_WORK_DURATION
    },
    {
      title: 'Short Break',
      duration: SHORT_BREAK_DURATION
    },
    {
      title: 'Study/Work',
      duration: STUDY_WORK_DURATION
    },
    {
      title: 'Long Break',
      duration: LONG_BREAK_DURATION
    }
  ]
};
const getters = {};
const mutations = {
  TOGGLE_STUDY_TOOLS_TIMER: state => {
    state.paused = !this.paused;

    if (state.paused) {
      clearInterval(this.timer);
      state.timer = null;
    } else {
      state.timer = setInterval(() => this.countdown(), 1000);
    }
  },
  DECREMENT_TIMER: state => {
    if (state.totalTime === 0) { this.nextStage(); } else { state.totalTime--; }
  }

};

export default {
  state,
  getters,
  mutations
};
