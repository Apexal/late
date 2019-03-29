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
          {{ addingAnnouncement ? 'Add Announcement' : 'Announcements' }}
        </p>
        <button
          class="delete"
          aria-label="close"
          @click="$emit('close-modal')"
        />
      </header>
      <section class="modal-card-body">
        <template v-if="addingAnnouncement">
          <form
            class="add-announcement-form"
            @submit.prevent="addAnnouncement"
          />
        </template>
        <template v-else>
          <article
            v-for="announcement in announcements"
            :key="announcement._id"
            class="announcement box"
          >
            <strong class="announcement-title is-size-5">
              <i
                v-if="announcement.isPinned"
                title="This announcement is pinned."
                class="fas fa-thumbtack"
              />
              {{ announcement.title }}
            </strong>
            <div class="announcement-body content">
              <p>{{ announcement.body }}</p>
            </div>
            <small
              :data-tooltip="formatDate(announcement.createdAt)"
              class="tooltip has-text-grey"
            >Posted {{ fromNow(announcement.createdAt) }} by {{ announcement._student.display_name }}</small>
          </article>
        </template>
      </section>
      <footer class="modal-card-foot">
        <button
          v-if="user.admin"
          class="button is-success"
          :class="{ 'is-loading': loading }"
          @click="addingAnnouncement = !addingAnnouncement"
        >
          {{ addingAnnouncement ? 'Save' : 'New Announcement' }}
        </button>
        <button
          class="button"
          @click="$emit('close-modal')"
        >
          Close
        </button>
      </footer>
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
  data () {
    return {
      addingAnnouncement: false,
      loading: false,
      newModal: {
        title: '',
        body: '',
        isPinned: false
      }
    };
  },
  computed: {
    user () {
      return this.$store.state.auth.user;
    }
  },
  methods: {
    formatDate (date) {
      return moment(date).format('M/DD/YY h:mma');
    },
    fromNow (date) {
      return moment(date).fromNow();
    },
    async addAnnouncement () {
      alert('wee woo');
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
