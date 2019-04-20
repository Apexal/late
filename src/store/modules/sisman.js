const state = {
  showing: true,
  peeking: true,
  moving: false,
  relativePosition: 80,
  message: 'Hey there...',
  side: 'bottom' // top, bottom, left, right
};

const getters = {
  SISManCSS: state => {
    let side = state.side === 'top' || state.side === 'bottom' ? 'left' : 'top';

    let classes = [state.side];
    if (state.showing) classes.push('showing');
    if (state.peeking) classes.push('peeking');

    return {
      classes,
      style: {
        [side]: state.relativePosition + '%'
      }
    };
  }
};

const sides = ['top', 'bottom', 'left', 'right'];
const actions = {
  DISMISS_SISMAN ({ commit }) {
    commit('SET_SISMAN_IS_PEEKING', false);
  },
  SUMMON_SISMAN ({ commit }, options = {}) {
    commit('SET_SISMAN_IS_PEEKING', false);
    setTimeout(() => {
      commit('SET_SISMAN_IS_SHOWING', false);
      commit(
        'SET_SISMAN_SIDE',
        options.side || sides[Math.floor(Math.random() * sides.length)]
      );
      if (options.message) commit('SET_SISMAN_MESSAGE', options.message);
      commit(
        'SET_SISMAN_RELATIVE_POSITION',
        options.relativePosition || Math.floor(Math.random() * (85 - 20)) + 20
      );
    }, 1000);

    // If given a percent chance, only show randomly
    if (!options.chance || Math.random() < options.chance) {
      setTimeout(() => commit('SET_SISMAN_IS_SHOWING', true), 1500);
      setTimeout(() => {
        commit('SET_SISMAN_IS_PEEKING', true);
      }, 4000);
    }
  }
};

const mutations = {
  SET_SISMAN_MESSAGE: (state, message) => {
    state.message = message;
  },
  SET_SISMAN_IS_SHOWING: (state, status) => {
    state.showing = status;
  },
  SET_SISMAN_IS_PEEKING: (state, peeking) => {
    state.peeking = peeking;
  },
  SET_SISMAN_RELATIVE_POSITION: (state, relativePosition) => {
    state.relativePosition = relativePosition;
  },
  SET_SISMAN_SIDE: (state, side) => {
    if (!['top', 'bottom', 'left', 'right'].includes(side)) return;
    state.side = side;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
