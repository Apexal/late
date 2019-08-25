<template>
  <section class="section dorm-photos">
    <h1 class="title">
      Dorm Photo Directory
    </h1>

    <div class="columns is-multiline dorm-photos">
      <div
        v-for="photo in dormPhotos"
        :key="photo.imageURL"
        class="column is-one-third dorm-photo"
      >
        <img
          :src="photo.imageURL"
          :alt="'Photo of ' + photo.dorm"
        >
        <h2 class="subtitle">
          {{ photo.dorm }}
        </h2>
        <small
          v-if="photo.floor"
          class="has-text-grey"
        >Floor {{ photo.floor }}</small>
      </div>
    </div>

    <hr>
    <b-button
      type="is-dark"
      @click="submittingPhoto=true"
    >
      Submit Photo
    </b-button>

    <b-modal :active.sync="submittingPhoto">
      <form
        class="box submit-photo"
        @submit.prevent="submitPhoto"
      >
        <div class="columns">
          <div class="column is-one-third">
            <b-field label="Choose a Photo">
              <b-input
                type="file"
                name="photo"
                accept="image/*"
                required
              />
            </b-field>
          </div>
          <div class="column is-one-third">
            <b-field label="What Dorm?">
              <b-select placeholder="Select dorm">
                <optgroup
                  v-for="(dorms, grade) in categorizedDorms"
                  :key="grade"
                  :label="grade"
                >
                  <option
                    v-for="(name, key) in dorms"
                    :key="key"
                    value="key"
                  >
                    {{ name }}
                  </option>
                </optgroup>
              </b-select>
            </b-field>
          </div>
          <div class="column is-one-third">
            <b-field label="What floor?">
              <b-input
                type="number"
                min="0"
                max="10"
                name="floor"
                placeholder="(optional)"
              />
            </b-field>
          </div>
        </div>

        <input
          type="submit"
          class="button is-dark"
          value="Submit for Approval"
        >
      </form>
    </b-modal>
  </section>
</template>

<script>
export default {
  name: 'DormPhotos',
  data () {
    return {
      dormPhotos: [],
      categorizedDorms: {
        Freshmen: {
          'barton-hall': 'Barton Hall',
          'bray-hall': 'Bray Hall',
          'burdett-avenue-residence-hall': 'Burdett Avenue Residence Hall'
        },
        Sophomore: {
          'beman-and-brinsmade': 'RAHP B (Beman and Brinsmade)'
        }
      },
      submittingPhoto: false
    }
  },
  computed: {

  },
  mounted () {
    this.getPhotos()
  },
  methods: {
    async getPhotos () {
      const request = await this.$http.get('/dormphotos')
      this.dormPhotos = request.data.dormPhotos
    },
    async submitPhoto (event) {
      const photo = event.target.photo.files[0]
      const dorm = event.target.dorm.value
      const floor = event.target.floor.value

      const formData = new FormData()
      formData.append('photo', photo)
      formData.append('dorm', dorm)
      if (floor) {
        formData.append('floor', floor)
      }

      let request
      try {
        request = await this.$http.post('/dormphotos', formData)
      } catch (e) {
        this.$buefy.toast.open({ type: 'is-error', message: e.request.data.message })
        return
      }

      event.target.photo.value = ''
      event.target.dorm.value = ''
      event.target.floor.value = ''

      this.$buefy.toast.open({ type: 'is-success', message: 'Your photo has been submitted to the administrators! Thank you!' })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
