<template>
  <div class="dorm-photos-view">
    <b-loading
      :is-full-page="false"
      :active="loading"
      :can-cancel="false"
    />

    <h2 class="subtitle">
      {{ dorm.name }}
    </h2>

    <p
      v-if="dormPhotos.length === 0"
      class="has-text-centered has-text-grey"
    >
      Nobody has submitted any photos of <b>{{ dorm.name }}</b> yet! Be the first to!
    </p>
    <details
      v-for="(photos, style) in photosOrganizedByStyle"
      :key="style"
    >
      <summary>
        <h2 class="subtitle style">
          {{ style }}
          <small class="has-text-grey">{{ photos.length }} photos</small>
        </h2>
      </summary>

      <div class="columns is-multiline photos">
        <div
          v-for="photo in photos"
          :key="photo.id"
          class="column is-one-third-desktop is-half-tablet is-full"
        >
          <div class="card">
            <div class="card-image">
              <img
                :src="photo.imageURL"
                class="dorm-photo"
              >
            </div>
            <div
              class="card-content has-text-centered has-text-grey"
              :title="longDateTimeFormat(photo.createdAt)"
            >
              Submitted {{ fromNow(photo.createdAt) }}
            </div>
          </div>
        </div>
      </div>
    </details>

    <hr>
  </div>
</template>

<script>
export default {
  name: 'DormPhotosView',
  props: {
    allDorms: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      loading: true,
      dormPhotos: []
    }
  },
  computed: {
    dorm () {
      return this.allDorms.find(dorm => dorm.key === this.$route.params.dormKey)
    },
    photosOrganizedByStyle () {
      const styles = {}
      for (const photo of this.dormPhotos) {
        if (!styles[photo.style]) styles[photo.style] = []
        styles[photo.style].push(photo)
      }
      return styles
    }
  },
  mounted () {
    this.getDormPhotos()
  },
  methods: {
    async getDormPhotos () {
      this.loading = true

      let request

      request = await this.$http.get('/dormphotos', { params: { dormKey: this.$route.params.dormKey } })

      this.dormPhotos = request.data.dormPhotos

      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.style {
  display: inline-block;
  text-transform: capitalize;
}
.dorm-photo {
  width: 100%;
}
.card-content {
  padding: 0.5em;
}
</style>
