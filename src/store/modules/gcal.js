import axios from '@/api';

const actions = {
  async ADD_GCAL_EVENT_FOR_WORK_BLOCK ({ rootState }, { assessmentType, assessment, block }) {
    const assessmentURL = `https://rpi-late.herokuapp.com/${assessmentType + 's'}/${assessment._id}`;

    let request = await axios.post('/google/calendars/events', {
      calendarId: rootState.auth.user.integrations.google.calendarIDs.workBlocks,
      summary: `${assessmentType === 'assignment' ? 'Work on' : 'Study for'} ${assessment.title}`,
      description: `View '${assessment.title}' at ${assessmentURL}.`,
      source: {
        title: assessment.title,
        url: assessmentURL
      },
      extendedProperties: {
        private: {
          scheduleByLATE: true,
          assessmentID: assessment._id
        }
      },
      ...block.asGoogleCalendarEvent
    });

    return request.data;
  }
};

export default {
  actions
};
