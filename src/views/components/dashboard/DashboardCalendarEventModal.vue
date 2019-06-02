<template>
  <b-modal
    :active="open"
    class="dashboard-calendar-event-modal"
    @close="$emit('close-modal')"
  >
    <div class="modal-content box">
      <p>{{ event.title }}</p>
      <hr>
      <span
        class="has-text-grey"
      >{{ shortDateTimeFormat(event.start) }}
        {{ event.allDay ? "" : "to " + shortDateTimeFormat(event.end) }}</span>
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
  }
};
</script>

<style lang="scss" scoped>
</style>
