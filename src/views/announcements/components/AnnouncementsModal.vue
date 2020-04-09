<!--Modals: View all announcements-->
<template>
  <b-modal
    has-modal-card
    class="announcements-modal"
    :active="open"
    @close="$emit('close-modal')"
  >
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          {{ addingAnnouncement ? "Add Announcement" : "Announcements" }}
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
                  placeholder="Announcement text. Markdown is supported!"
                />
              </div>
            </div>

            <div class="field">
              <b-checkbox v-model="newAnnouncement.isPinned">
                Pin Announcement
              </b-checkbox>
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
            <VueMarkdown
              class="announcement-body"
              :source="announcement.body"
              :html="false"
              :emoji="true"
              :anchor-attributes="{target: '_blank'}"
            />
            <small
              :data-tooltip="shortDateTimeFormat(announcement.createdAt)"
              class="tooltip has-text-grey"
            >
              Posted {{ fromNow(announcement.createdAt) }} by
              {{ announcement._student.displayName }}
            </small>
            <template v-if="user.admin">
              <hr>
              <div class="buttons">
                <b-button
                  type="is-info"
                  size="is-small"
                  @click="togglePinned(announcement)"
                >
                  {{ announcement.isPinned ? 'Unpin' : 'Pin' }}
                </b-button>
                <b-button
                  type="is-danger"
                  size="is-small"
                  @click="deleteAnnouncement(announcement)"
                >
                  Delete
                </b-button>
              </div>
            </template>
          </article>
        </template>
      </section>
      <footer class="modal-card-foot">
        <b-button
          v-if="user.admin"
          type="is-success"
          :loading="loading"
          @click="buttonClick"
        >
          {{ addingAnnouncement ? "Save" : "New Announcement" }}
        </b-button>
        <b-button @click="cancelButtonClick">
          {{ addingAnnouncement ? "Cancel" : "Close" }}
        </b-button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
import VueMarkdown from 'vue-markdown'

export default {
  name: 'AnnouncementsModal',
  components: { VueMarkdown },
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
    }
  },
  methods: {
    buttonClick () {
      if (this.addingAnnouncement) return this.addAnnouncement()
      else this.addingAnnouncement = true
    },
    cancelButtonClick () {
      if (this.addingAnnouncement) this.addingAnnouncement = false
      else this.$emit('close-modal')
    },
    async addAnnouncement () {
      this.loading = true

      let request
      try {
        request = await this.$http.post('/announcements', this.newAnnouncement)
      } catch (e) {
        this.showError(e.response.data.message)
        this.loading = false
        return
      }

      this.$store.commit('ADD_ANNOUNCEMENT', request.data.createdAnnouncement)
      this.$buefy.toast.open({
        type: 'is-success',
        message: 'Posted new announcement.'
      })

      this.$socket.client.emit('new announcement', request.data.createdAnnouncement)

      this.addingAnnouncement = {
        title: '',
        body: '',
        isPinned: false
      }
      this.loading = false
    },
    async togglePinned (announcement) {
      if (!this.user.admin) return

      let request
      try {
        request = await this.$http.patch(`/announcements/${announcement._id}`, {
          isPinned: !announcement.isPinned
        })
      } catch (e) {
        return this.showError(e.response.data.message)
      }

      this.$store.commit('UPDATE_ANNOUNCEMENT', request.data.updatedAnnouncement)

      this.$buefy.toast.open({ type: 'is-success', message: 'Updated announcement!' })
    },
    async deleteAnnouncement (announcement) {
      if (!this.user.admin) return

      let request
      try {
        request = await this.$http.delete(`/announcements/${announcement._id}`)
      } catch (e) {
        return this.showError(e.response.data.message)
      }

      this.$store.commit('REMOVE_ANNOUNCEMENT', request.data.deletedAnnouncement)

      this.$buefy.toast.open({ type: 'is-success', message: 'Deleted announcement!' })
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-card-foot {
  justify-content: flex-end;
}
</style>
