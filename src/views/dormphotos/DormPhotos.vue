<template>
  <section class="section dorm-photos">
    <h1 class="title">
      RPI Dorm Photo Directory
    </h1>

    <router-view
      :all-dorms="allDorms"
      @open-submit-photo-modal="submittingPhoto=true"
    />

    <div class="buttons">
      <router-link
        v-if="$route.name !== 'dorm-photos'"
        :to="{name: 'dorm-photos'}"
        class="button is-link"
      >
        Back
      </router-link>
      <router-link
        v-if="loggedIn && user.admin"
        :to="{name: 'dorm-photos-confirm'}"
        class="button is-warning"
      >
        <i class="fas fa-check-circle" />
        Confirm Submissions
      </router-link>
      <b-button
        type="is-dark"
        @click="submittingPhoto=true"
      >
        <i class="fas fa-camera" />
        Submit Photo
      </b-button>
    </div>

    <SubmitPhotoModal
      :open="submittingPhoto"
      :all-dorms="allDorms"
      :loading="loadingSubmitting"
      @submit-photo="submitPhoto"
      @close-modal="submittingPhoto = false"
    />
  </section>
</template>

<script>
import dorms from '@/modules/dorms'

import SubmitPhotoModal from './components/SubmitPhotoModal'

export default {
  name: 'DormPhotos',
  components: { SubmitPhotoModal },
  data () {
    return {
      loadingSubmitting: false,
      submittingPhoto: false
    }
  },
  computed: {
    allDorms () {
      return dorms
    },
    categorizedDorms () {
      const catergories = {}
      for (const dorm of dorms) {
        catergories[dorm.grade] = catergories[dorm.grade] || []
        catergories[dorm.grade].push(dorm)
      }

      return catergories
    }
  },
  mounted () {
    // this.getPhotos()
  },
  methods: {
    async getPhotos () {
      const request = await this.$http.get('/dormphotos')
      this.dormPhotos = request.data.dormPhotos
    },
    async submitPhoto ({ photo, dormKey, style }) {
      this.loadingSubmitting = true

      const formData = new FormData()
      formData.append('photo', photo)
      formData.append('dormKey', dormKey)
      formData.append('style', style)

      let request
      try {
        request = await this.$http.post('/dormphotos', formData)
      } catch (e) {
        console.error(e)
        this.$buefy.toast.open({ type: 'is-error', message: e.request.data.message })
        return
      }

      this.$buefy.toast.open({ type: 'is-success', message: 'Your photo has been submitted to the administrators! Thank you!' })

      this.loadingSubmitting = false
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
