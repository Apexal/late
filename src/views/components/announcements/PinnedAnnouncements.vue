<template>
  <section
    v-if="pinnedAnnouncements.length > 0"
    class="section pinned-announcements"
    title="Pinned announcement"
  >
    <details
      v-for="ann in pinnedAnnouncements"
      :key="ann._id"
      class="notification pinned-announcement is-primary"
    >
      <summary>
        <i class="fas fa-thumbtack" />
        <strong>Pinned Announcement:</strong>
        {{ ann.title }}
        <a
          class="delete is-pulled-right"
          @click="dismissPinnedAnnouncement(ann._id)"
        />
      </summary>
      <VueMarkdown
        class="announcement-body"
        :source="ann.body"
        :html="false"
        :emoji="true"
        :anchor-attributes="{target: '_blank'}"
      />
    </details>
  </section>
</template>

<script>
import VueMarkdown from 'vue-markdown';

export default {
  name: 'PinnedAnnouncements',
  components: { VueMarkdown },
  computed: {
    pinnedAnnouncements () {
      return this.$store.getters.pinnedAnnouncements;
    },
    dismissedAnnouncementIDs () {
      return this.$store.state.announcements.dismissedIDs;
    }
  },
  methods: {
    dismissPinnedAnnouncement (id) {
      localStorage.setItem(
        'dismissedAnnouncementIDs',
        JSON.stringify(this.dismissedAnnouncementIDs.concat(id))
      );

      this.$store.commit(
        'SET_DISMISSED_ANNOUNCEMENT_IDS',
        this.dismissedAnnouncementIDs.concat(id)
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.pinned-announcements {
  padding-bottom: 0;
  padding-top: 2em;

  .pinned-announcement {
    padding: 10px;
    transition: 0.2s;
    -webkit-transition: 0.2s;
    .fas.fa-thumbtack {
      margin-right: 5px;
    }
    summary {
      cursor: pointer;
      font-size: 1.2em;
      margin-bottom: 3px;
    }
  }

  .pinned-announcement:hover {
    background-color: #6abfc5;
    transition: 0.2s;
    -webkit-transition: 0.2s;
  }
}
</style>
