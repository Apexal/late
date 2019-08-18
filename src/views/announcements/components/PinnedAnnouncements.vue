<!--Pinned announcement module-->
<template>
  <section
    v-if="pinnedAnnouncements.length > 0"
    class="section pinned-announcements"
    title="Pinned announcement"
  >
    <b-notification
      v-for="ann in pinnedAnnouncements"
      :key="ann._id"
      type="is-info"
      class="pinned-announcement"
      aria-close-label="Close notification"
      @close="dismissPinnedAnnouncement(ann._id)"
    >
      <details>
        <summary>
          <i class="fas fa-thumbtack" />
          <strong>Pinned Announcement:</strong>
          {{ ann.title }}
        </summary>
        <VueMarkdown
          class="announcement-body"
          :source="ann.body"
          :html="false"
          :emoji="true"
          :anchor-attributes="{target: '_blank'}"
        />
      </details>
    </b-notification>
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
  .fas.fa-thumbtack {
    margin-right: 5px;
  }

  // .pinned-announcement {
  //   padding: 10px;
  //   transition: 0.2s;
  //   -webkit-transition: 0.2s;
  //
  //   summary {
  //     cursor: pointer;
  //     font-size: 1.2em;
  //     margin-bottom: 3px;
  //   }
  // }
}
</style>
