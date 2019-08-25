<template>
  <section class="section dorm-photos">
    <h1 class="title">
      Dorm Photo Directory
    </h1>

    <router-view />

    <hr>
    <b-button
      type="is-dark"
      @click="submittingPhoto=true"
    >
      Submit Photo
    </b-button>

    <SubmitPhotoModal
      :open="submittingPhoto"
      :all-dorms="allDorms"
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
      dormPhotos: [],
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
    this.getPhotos()
  },
  methods: {
    async getPhotos () {
      const request = await this.$http.get('/dormphotos')
      this.dormPhotos = request.data.dormPhotos
    },
    async submitPhoto ({ photo, dormKey, style }) {
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
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  padding-bottom: 0px;
  padding-left: 0px;
  border-bottom-color: #dbdbdb;
  border-bottom-style: solid;
  border-bottom-width: 1px;
}
</style>
