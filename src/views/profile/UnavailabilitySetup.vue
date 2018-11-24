<template>
  <div class="unavailability-setup">
    <h2 class="subtit">Drag to set your study/work unavailability</h2>
    <p class="help">Click on blocks to remove them. You can also drag, drop, and resive them.</p>
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
      Save Unavailability
    </button>
  </div>
</template>

<script>
import moment from 'moment';
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';
export default {
  name: 'UnavailabilitySetup',
  components: { FullCalendar },
  data () {
    return {
      loading: false,
      saved: true,
      calendar: {
        events: this.$store.getters.getCourseScheduleAsEvents.concat(this.$store.getters.getUnavailabilityAsEvents),
        header: {
          left: '',
          center: '',
          right: ''
        },
        config: {
          // timezone: 'UTC',
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
            this.calendar.events = this.calendar.events.filter(e => !moment(e.start).isSame(moment(calEvent.start)));
          },

          select: (start, end) => {
            const eventData = {
              title: 'Unavailable',
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

      const request = await this.$http.post('/setup/unavailability', {
        events
      });

      await this.$store.dispatch('SET_USER', request.data.updatedUser);

      // Notify user of success
      this.$store.dispatch('ADD_NOTIFICATION', { type: 'success', description: 'Set study/work unavailability schedule!' });

      this.loading = false;
      this.saved = true;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
