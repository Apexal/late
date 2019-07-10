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
  async socket_updatedAssessment ({ rootState, getters, commit, dispatch }, { assessment }) {
    const cR = router.currentRoute;
    const currentlyViewing = cR.name === `${assessment.assessmentType}-overview` && cR.params[assessment.assessmentType + 'ID'] === assessment._id;

    // Check if the assessment owner stoped sharing with us!
    if (!assessment.sharedWith.includes(rootState.auth.user.rcs_id)) {
      if (currentlyViewing) {
        router.push('/coursework');
      }

      if (getters.getUpcomingAssessmentById(assessment._id)) {
        commit('REMOVE_UPCOMING_ASSESSMENT', assessment);
      }

      Snackbar.open({
        duration: 5000,
        message: `The ${assessment.assessmentType} owner stopped sharing <b>${assessment.title}</b> with you!`,
        type: 'is-info',
        position: 'is-bottom-left'
      });
      return;
    }

    if (getters.getUpcomingAssessmentById(assessment._id)) {
      await dispatch('UPDATE_UPCOMING_ASSESSMENT', assessment);
    }

    if (currentlyViewing) {
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
