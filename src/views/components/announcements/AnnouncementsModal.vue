<template>
  <div
    class="modal announcements-modal"
    :class="{ 'is-active': open }"
  >
    <div
      class="modal-background"
      @click="$emit('close-modal')"
    />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Announcements
        </p>
        <button
          class="delete"
          aria-label="close"
          @click="$emit('close-modal')"
        />
      </header>
      <section class="modal-card-body">
        <article
          v-for="announcement in announcements"
          :key="announcement._id"
          class="announcement box"
        >
          <strong class="announcement-title is-size-5">{{ announcement.title }}</strong>
          <div class="announcement-body content">
            <p>{{ announcement.body }}</p>
          </div>
          <small
            :data-tooltip="formatDate(announcement.createdAt)"
            class="tooltip has-text-grey"
          >Posted {{ fromNow(announcement.createdAt) }} by {{ announcement._student.display_name }}</small>
        </article>
      </section>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'AnnouncementsModal',
  props: {
    open: { type: Boolean, required: true },
    announcements: {
      type: Array,
      required: true
    }
  },
  methods: {
    formatDate (date) {
      return moment(date).format('M/DD/YY h:mma');
    },
    fromNow (date) {
      return moment(date).fromNow();
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
