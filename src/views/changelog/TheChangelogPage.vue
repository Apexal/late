<template>
  <section class="section changelog-page">
    <h1 class="title">
      Changelog
    </h1>

    <p
      v-if="releases.length === 0"
      class="has-text-centered has-text-grey"
    >
      No releases have been posted yet!
    </p>
    <article
      v-for="release in releases"
      :key="release.id"
      class="box release"
    >
      <header>
        <h2 class="title is-size-4">
          <span class="tag is-warning is-pulled-right version"><span v-if="release.prerelease">Pre-Release</span> v{{ release.tag_name }}</span>
          <a
            class="release-name"
            :href="release.html_url"
            target="_blank"
          >{{ release.name }}</a>
        </h2>
      </header>

      <VueMarkdown
        class="release-body"
        :source="release.body"
        :html="false"
        :emoji="true"
        :anchor-attributes="{target: '_blank'}"
      />

      <hr>
      <footer class="has-text-grey">
        <small
          class="is-pulled-right"
          :title="fromNow(release.published_at)"
        >Published {{ shortDateTimeFormat(release.published_at) }}</small>
        <small>Posted by <a
          :href="release.author.html_url"
          target="_blank"
        ><img
          class="author-avatar"
          :src="release.author.avatar_url"
          alt="Avatar"
        > {{ release.author.login }}</a></small>
      </footer>
    </article>
  </section>
</template>

<script>
import VueMarkdown from 'vue-markdown'

export default {
  name: 'TheChangelogPage',
  components: { VueMarkdown },
  data () {
    return {
      releases: []
    }
  },
  mounted () {
    this.getReleases()
  },
  methods: {
    async getReleases () {
      const response = await this.$http.get('/integrations/changelog')
      this.releases = response.data.releases
      console.log(response.data.releases)
    }
  }
}
</script>

<style lang="scss" scoped>
.release header {
  margin-bottom: 20px;

  a.release-name {
    color: inherit;
  }
}

.release .author-avatar {
  border-radius: 10px;
  width: 20px;
  vertical-align: middle;
}
</style>
