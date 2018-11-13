<template>
  <div class="work-schedule-setup">
    <h2 class="subtit">Drag to set your work/study availability</h2>
    <p class="help">Click on work/study blocks to remove them. You can also drag, drop, and resive them.</p>
    <FullCalendar
      ref="calendar"
      :events="calendar.events"
      :editable="true"
      :selectable="true"
      :header="calendar.header"
      :config="calendar.config"
      @event-resize="eventResized"
    />
    <button
      class="button is-success"
      :class="{'is-loading': loading}"
      :disabled="saved"
      @click="save"
    >
      Save Availability
    </button>
  </div>
</template>

<script>
import API from '../../api';
import moment from 'moment';
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';
export default {
  name: 'WorkScheduleSetup',
  components: { FullCalendar },
  data () {
    return {
      loading: false,
      saved: true,
      calendar: {
        events: this.$store.getters.getCourseScheduleAsEvents.concat(this.$store.getters.getWorkBlocksAsEvents),
        header: {
          left: '',
          center: '',
          right: ''
        },
        config: {
          navLinks: false,
          defaultView: 'agendaWeek',
          selectHelper: true,
          eventOverlap: false,
          selectOverlap: false,
          eventColor: 'black',
          timeFormat: 'h(:mm)t',
          eventClick: (calEvent, jsEvent, view) => {
            if (!calEvent.isWorkBlock) return;
            this.saved = false;
            this.calendar.events = this.calendar.events.filter(e => {
              return moment(e.start).format('YYYY-MM-DD Hmm') !== moment(calEvent.start).format('YYYY-MM-DD Hmm');
            });
          },

          select: (start, end) => {
            const eventData = {
              title: 'Work/Study',
              start: start,
              end: end,
              isWorkBlock: true
            };
            this.calendar.events.push(eventData);
            this.$refs.calendar.fireMethod('unselect');
            this.saved = false;
          }
        }
      }
    };
  },
  computed: {
  },
  methods: {
    eventResized (calEvent) {
      this.saved = false;
      this.calendar.events.find(e => moment(e.start).isSame(moment(calEvent.start))).end = calEvent.end;
    },
    async save () {
      this.loading = true;
      const events = this.calendar.events.filter(e => e.isWorkBlock);

      const request = await API.post('/setup/workschedule', {
        events
      });

      await this.$store.dispatch('SET_USER', request.data.updatedUser);

      // Notify user of success
      this.$store.commit('ADD_NOTIFICATION', { type: 'success', description: 'Set work/study availability schedule!' });

      this.loading = false;
      this.saved = true;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
