<!--Modals: Course overview modal links module-->
<template>
  <div class="course-links">
    <ul
      v-if="links && links.length > 0"
      class="course-links"
    >
      <li
        v-for="l in links"
        :key="l.url"
      >
        <a
          :href="l.url"
          target="_blank"
          :title="l.url"
        >{{ l.name }}</a>
      </li>
    </ul>
    <p
      v-else
      class="has-text-centered has-text-grey"
    >
      You haven't added any links for this course yet.
    </p>
    <hr>
    <form @submit.prevent="addLink">
      <div class="field has-addons">
        <div class="control">
          <input
            v-model.trim="newLink.name"
            type="text"
            class="input"
            placeholder="Link title"
            required
          >
        </div>
        <div class="control is-expanded">
          <input
            v-model.trim="newLink.url"
            type="url"
            class="input"
            placeholder="Link URL"
            required
          >
        </div>
        <div class="control">
          <button class="button">
            Add Link
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'CourseModalLinks',
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      newLink: {
        name: '',
        url: ''
      }
    }
  },
  computed: {
    links () {
      return this.course.links || []
    }
  },
  methods: {
    async addLink () {
      const newLinks = [...this.links, this.newLink]

      try {
        // Send to server
        await this.$store.dispatch('UPDATE_COURSE', {
          courseID: this.course.id,
          updates: { links: newLinks }
        })
      } catch (e) {
        return this.showError('There was an issue adding that link...')
      }

      this.newLink = {
        name: '',
        url: ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.course-links li {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
