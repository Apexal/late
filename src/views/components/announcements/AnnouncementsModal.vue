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
      </header>
      <section class="modal-card-body">
        <template v-if="addingAnnouncement">
          <form
            class="add-announcement-form"
            @submit.prevent="addAnnouncement"
          >
            <div class="field">
              <label
                for="new-announcement-title"
                class="label"
              >Title</label>
              <div class="control">
                <input
                  id="new-announcement-title"
                  v-model="newAnnouncement.title"
                  class="input"
                  type="text"
                  placeholder="Announcement Title"
                >
              </div>
            </div>

            <div class="field">
              <label
                for="new-announcement-body"
                class="label"
              >Body</label>
              <div class="control">
                <textarea
                  id="new-announcement-body"
                  v-model="newAnnouncement.body"
                  class="textarea"
                  placeholder="Announcement text."
                />
              </div>
            </div>

            <div class="field">
              <div class="control">
                <label class="checkbox">
                  <input
                    v-model="newAnnouncement.isPinned"
                    type="checkbox"
                  >
                  Pin Announcement
                </label>
              </div>
            </div>
          </form>
        </template>
        <template v-else>
          <p
            v-if="announcements.length === 0"
            class="has-text-centered has-tex"
          >
            No announcements have been posted by admins yet!
          </p>
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
          @click="buttonClick"
        >
          {{ addingAnnouncement ? 'Save' : 'New Announcement' }}
        </button>
        <button
          class="button"
          @click="cancelButtonClick"
        >
          {{ addingAnnouncement ? 'Cancel' : 'Close' }}
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
      newAnnouncement: {
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
    buttonClick () {
      if (this.addingAnnouncement) return this.addAnnouncement();
      else this.addingAnnouncement = true;
    },
    cancelButtonClick () {
      if (this.addingAnnouncement) this.addingAnnouncement = false;
      else this.$emit('close-modal');
    },
    async addAnnouncement () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post('/announcements', this.newAnnouncement);
      } catch (e) {
        this.$toasted.error(e.request.data.message);
        this.loading = false;
        return;
      }

      this.$store.commit('ADD_ANNOUNCEMENT', request.data.createdAnnouncement);
      this.$toasted.success('Posted new announcement.');

      this.addingAnnouncement = {
        title: '',
        body: '',
        isPinned: false
      };
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
