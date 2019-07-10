import { Snackbar } from 'buefy/dist/components/snackbar';
import router from '@/router';

const state = {
  onlineUsers: []
};

const getters = {};

const actions = {
  socket_online ({ commit }, online) {
    commit('SET_ONLINE_USERS', online);
  },
  async socket_updatedAssessment ({ getters, dispatch }, { assessment }) {
    if (getters.getUpcomingAssessmentById(assessment._id)) {
      await dispatch('UPDATE_UPCOMING_ASSESSMENT', assessment);
    }

    const cR = router.currentRoute;

    if (cR.name === `${assessment.assessmentType}-overview` && cR.params[assessment.assessmentType + 'ID'] === assessment._id) {
      Snackbar.open({
        duration: 5000,
        message: `A collaborator just updated this ${assessment.assessmentType}!`,
        type: 'is-info',
        position: 'is-bottom-left'
      });
    } else {
      Snackbar.open({
        duration: 5000,
        message: `A collaborator just updated <b>${assessment.title}</b>`,
        type: 'is-info',
        position: 'is-bottom-left',
        actionText: 'View',
        queue: false,
        onAction: () => {
          router.push({
            name: assessment.assessmentType + '-overview',
            params: { [assessment.assessmentType + 'ID']: assessment._id }
          });
        }
      });
    }
  }
};

const mutations = {
  SET_ONLINE_USERS: (state, online) => {
    state.onlineUsers = online;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
