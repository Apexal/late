const STUDY_WORK_DURATION = 5; // 25 * 60;
const SHORT_BREAK_DURATION = 10; // 5 * 60;
const LONG_BREAK_DURATION = 15; // 15 * 60;

const padTime = time => (time < 10 ? '0' : '') + time;

const state = {
  open: false,
  initialTime: 25 * 60,
  timer: null,
  totalTime: 5,
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
const getters = {
  studyToolsTimerCurrentStage: state => state.stages[state.stageIndex],
  studyToolsTimerMinutes: state => padTime(Math.floor(state.totalTime / 60)),
  studyToolsTimerSeconds: state => padTime(state.totalTime % 60)
};
const actions = {
  SET_STUDY_TOOLS_TIMER_OPEN ({ commit }, isOpen) {
    commit('SET_STUDY_TOOLS_TIMER_OPEN', isOpen);

    if (!isOpen) commit('RESET_STUDY_TOOLS_TIMER');
  },
  STUDY_TOOLS_TIMER_COUNTDOWN ({ commit, dispatch, state }) {
    commit('DECREMENT_STUDY_TOOLS_TIMER');
    if (state.totalTime === 0) {
      clearInterval(state.timer);
      commit('SET_STUDY_TOOLS_TIMER', null);
      const nextStageIndex =
        state.stageIndex + 1 === state.stages.length ? 0 : state.stageIndex + 1;
      alert(`Time's up! Next is ${state.stages[nextStageIndex].title}`);
      commit('SET_STUDY_TOOLS_TIMER_OPEN', true);
      commit(
        'SET_STUDY_TOOLS_TIMER',
        setInterval(() => dispatch('STUDY_TOOLS_TIMER_COUNTDOWN'), 1000)
      );
      commit('STUDY_TOOLS_TIMER_NEXT_STAGE');
    }
  },
  TOGGLE_STUDY_TOOLS_TIMER ({ commit, state, dispatch }) {
    commit('TOGGLE_STUDY_TOOLS_TIMER');
    if (state.paused) {
      clearInterval(state.timer);
      commit('SET_STUDY_TOOLS_TIMER', null);
    } else {
      commit('SET_STUDY_TOOLS_TIMER_OPEN', true);
      commit(
        'SET_STUDY_TOOLS_TIMER',
        setInterval(() => dispatch('STUDY_TOOLS_TIMER_COUNTDOWN'), 1000)
      );
    }
  }
};
const mutations = {
  SET_STUDY_TOOLS_TIMER_OPEN: (state, open) => {
    state.open = open;
  },
  TOGGLE_STUDY_TOOLS_TIMER: state => {
    state.paused = !state.paused;
  },
  SET_STUDY_TOOLS_TIMER: (state, timer) => {
    state.timer = timer;
  },
  RESET_STUDY_TOOLS_TIMER: state => {
    state.totalTime = state.stages[state.stageIndex].duration;
    clearInterval(state.timer);
    state.timer = null;
    state.paused = true;
  },
  STUDY_TOOLS_TIMER_PREV_STAGE: state => {
    state.stageIndex -= 1;
    if (state.stageIndex === -1) state.stageIndex = state.stages.length - 1;
    state.totalTime = state.stages[state.stageIndex].duration;
  },
  STUDY_TOOLS_TIMER_NEXT_STAGE: state => {
    state.stageIndex += 1;
    if (state.stageIndex === state.stages.length) state.stageIndex = 0;
    state.totalTime = state.stages[state.stageIndex].duration;
  },
  DECREMENT_STUDY_TOOLS_TIMER: state => {
    state.totalTime--;
  }
};

export default {
  state,
  actions,
  getters,
  mutations
};
