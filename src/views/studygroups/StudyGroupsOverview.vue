<template>
  <div class="study-groups-overview">
    <div
      class="has-text-centered-touch"
      style="margin:1em;float:left"
    >
      <div
        class="tag is-medium course-tag is-dark"
      >
        <router-link
          :to="{name: 'study-groups-home'}"
          class="has-text-white back-button"
        >
          <i class="fas fa-angle-left" />
          <b class="has-text-white">
            Study Groups
          </b>
        </router-link>
      </div>
    </div>
    <h1
      class="title"
      style="float:left;margin-top:0.4em;margin-left:0.1em;clear:right"
    >
      {{ groupInfo.title }}
    </h1>
    <nav
      class="box level has-text-white has-background-success group-stats"
      style="clear:left"
    >
      <div class="level-item has-text-centered">
        <div>
          <p
            class="heading"
          >
            Course
          </p>
          <p
            class="subtitle"
          >
            {{ groupInfo.course.title }}
          </p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p
            class="heading"
          >
            Location
          </p>
          <p
            class="subtitle"
          >
            {{ groupInfo.location }}
          </p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p
            class="heading"
          >
            Date/Time
          </p>
          <p
            class="subtitle"
          >
            {{ groupInfo.date }} @ {{ groupInfo.time }}
          </p>
        </div>
      </div>
    </nav>
    <div class="content description">
      <blockquote>
        <span
          v-if="groupInfo.description && groupInfo.description.length > 0"
        >
          {{ groupInfo.description }}
        </span>
        <i v-else>No description given.</i>
      </blockquote>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudyGroupsOverview',
  data () {
    return {
      groupInfo: null
    }
  },
  computed: {
    groupID () {
      return this.$route.params.groupID
    }
  },
  created () {
    this.getStudyGroup()
  },
  methods: {
    async getStudyGroup () {
      let request

      try {
        request = await this.$http.get('studygroups/' + this.groupID)
      } catch (e) {
        return this.showError(e.response.data.message)
      }

      this.groupInfo = request.data.studygroup
    }
  }
}
</script>

<style lang="scss" scoped>
.level.group-stats {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  margin-top: 20px;
  margin-bottom: 0;
  padding: 5px;

  .level-item .subtitle {
    color: white;
  }

  .decrease-priority,
  .increase-priority,
  .edit-date,
  .save-date {
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .save-date {
    margin-left: 5px;
  }
  .priority:hover {
    .decrease-priority,
    .increase-priority {
      opacity: 1;
    }
  }

  .date:hover {
    .edit-date,
    .save-date {
      opacity: 1;
    }
  }
}
</style>
