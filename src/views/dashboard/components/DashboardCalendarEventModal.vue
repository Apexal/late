<!--Modal: Calendar event modal-->
<template>
  <b-modal
    :active="open"
    class="dashboard-calendar-event-modal"
    @close="$emit('close-modal')"
  >
    <div class="modal-content box">
      <p>{{ event.title }}</p>
      <hr>
      <a
        v-if="eventURL"
        class="is-pulled-right"
        :href="eventURL"
        target="_blank"
      >More info</a>
      <span class="has-text-grey">
        {{ longDateFormat(event.start) }}
        {{ event.allDay ? "" : "to " + longDateFormat(event.end) }}
      </span>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'DashboardCalendarEventModal',
  props: {
    open: {
      type: Boolean,
      required: true
    },
    event: {
      type: Object,
      required: true
    }
  },
  computed: {
    eventURL () {
      if (!this.event.extendedProps) return
      return this.event.extendedProps.eventURL
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
