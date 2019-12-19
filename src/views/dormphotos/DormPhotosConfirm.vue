<template>
  <div class="dorm-photos-confirm">
    <b-loading
      :is-full-page="false"
      :active="loading"
      :can-cancel="false"
    />

    <h2 class="subtitle">
      <b-button
        class="is-pulled-right"
        :loading="loading"
        @click="getUnconfirmedDormPhotos"
      >
        Refresh
      </b-button>
      Confirm Dorm Photo Submissions ({{ unconfirmedDormPhotos.length }})
    </h2>
    <div class="columns is-multiline unconfirmed-photos">
      <div
        v-for="photo in unconfirmedDormPhotos"
        :key="photo.id"
        class="column is-one-third"
      >
        <div class="card">
          <header class="card-header">
            <p class="card-header-title">
              {{ getDormFromKey(photo.dormKey).name }} {{ photo.style }}
            </p>
          </header>
          <div class="card-image">
            <img
              :src="photo.imageURL"
              @click="focusedPhotoURL = photo.imageURL"
            >
          </div>

          <div class="card-content">
            <span :title="longDateTimeFormat(photo.createdAt)">
              Submitted <time datetime="photo.createdAt">{{ fromNow(photo.createdAt) }}</time>
            </span>
          </div>

          <footer class="card-footer">
            <a
              href="#"
              class="card-footer-item"
              @click="confirmPhoto(photo.id)"
            >Confirm</a>
            <a
              href="#"
              class="card-footer-item"
              @click="denyPhoto(photo.id)"
            >Deny</a>
          </footer>
        </div>
      </div>
    </div>

    <hr>

    <b-modal
      :active="focusedPhotoURL !== ''"
      @close="focusedPhotoURL = ''"
    >
      <p class="image">
        <img :src="focusedPhotoURL">
      </p>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'DormPhotosConfirm',
  props: {
    allDorms: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      loading: true,
      focusedPhotoURL: '',
      unconfirmedDormPhotos: []
    }
  },
  mounted () {
    this.getUnconfirmedDormPhotos()
  },
  methods: {
    getDormFromKey (dormKey) {
      return this.allDorms.find(dorm => dorm.key === dormKey)
    },
    async getUnconfirmedDormPhotos () {
      this.loading = true

      const request = await this.$http.get('/dormphotos', { params: { confirmed: false } })

      this.unconfirmedDormPhotos = request.data.dormPhotos

      this.loading = false
    },
    async confirmPhoto (photoID) {
      this.loading = true

      const request = await this.$http.post(`/dormphotos/${photoID}/confirm`)

      this.unconfirmedDormPhotos = this.unconfirmedDormPhotos.filter(photo => photo.id !== photoID)

      this.$buefy.toast.open({ type: 'is-success', message: 'You confirmed the photo!' })

      this.loading = false
    },
    async denyPhoto (photoID) {
      this.loading = true

      const request = await this.$http.delete(`/dormphotos/${photoID}`)

      this.unconfirmedDormPhotos = this.unconfirmedDormPhotos.filter(photo => photo.id !== photoID)

      this.$buefy.toast.open({ type: 'is-success', message: 'You deleted the photo!' })

      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.card-header-title {
  text-transform: capitalize;
}

.card-image img {
  width: 100%;
}
</style>
