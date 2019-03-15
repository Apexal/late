import axios from '@/api';

const actions = {
  async ADD_GCAL_EVENT_FOR_WORK_BLOCK (
    { rootGetters, rootState },
    { assessmentType, assessment, block }
  ) {
    const assessmentURL = `https://rpi-late.herokuapp.com/${assessmentType +
      's'}/${assessment._id}`;

    const course = rootGetters.getCourseFromCRN(assessment.courseCRN);
    const capitalizedAssessmentType =
      assessmentType === 'assignment' ? 'Assignment' : 'Exam';

    let request = await axios.post('/google/calendars/events', {
      calendarId:
        rootState.auth.user.integrations.google.calendarIDs.workBlocks,
      summary: `${assessmentType === 'assignment' ? 'Work on' : 'Study for'} ${
        assessment.title
      }`,
      description: `<b>${course.longname} ${capitalizedAssessmentType}</b> <i>${
        assessment.title
      }</i><br><br>${assessmentURL}`,
      source: {
        title: assessment.title,
        url: assessmentURL
      },
      extendedProperties: {
        private: {
          scheduleByLATE: true,
          assessmentID: assessment._id // links this event to the assessment
        }
      },
      ...block.asGoogleCalendarEvent
    });

    return request.data;
  },
  async DELETE_GCAL_EVENT_FOR_WORK_BLOCK ({ rootState }, { blockID }) {
    let request = await axios.delete(
      `/google/calendars/events/${
        rootState.auth.user.integrations.google.calendarIDs.workBlocks
      }/${blockID}`
    );

    return request.data;
  },
  async UPDATE_GCAL_EVENT (_, { calendarId, eventId, updates }) {
    let request = await axios.patch(
      `/google/calendars/events/${calendarId}/${eventId}`,
      updates
    );

    return request.data;
  }
};

export default {
  actions
};
