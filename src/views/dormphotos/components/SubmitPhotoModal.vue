<template>
  <b-modal
    :active="open"
    @close="$emit('close-modal')"
  >
    <form
      class="box submit-photo"
      @submit.prevent="emitSubmit"
    >
      <p>
        Submitting a photo of your current dorm room helps current and future students decide what
        dorms to choose! As a result, please make sure your photo <b>provides a good view of the whole room,
          is well lit, and is not blurry.</b> You can upload an existing photo or take one from your phone on the spot!
        Please consider submitting as many photos as you can,
      </p>
      <hr>

      <div class="columns">
        <div class="column">
          <b-field label="Choose the photo">
            <b-upload
              v-model="photo"
              accept="image/*"
              required
            >
              <a class="button is-primary">
                <b-icon icon="upload" />
                <span
                  v-if="photo"
                  :title="photo.name"
                >{{ photoNameTrimmed }}</span>
                <span v-else>Click to upload</span>
              </a>
            </b-upload>
          </b-field>
        </div>
        <div class="column">
          <b-field label="What dorm?">
            <b-select
              v-model="dormKey"
              class="dorm-select"
              placeholder="Select dorm"
              required
            >
              <optgroup
                v-for="(dorms, grade) in categorizedDorms"
                :key="grade"
                :label="grade.toUpperCase()"
              >
                <option
                  v-for="dorm in dorms"
                  :key="dorm.key"
                  :value="dorm.key"
                >
                  {{ dorm.name }}
                </option>
              </optgroup>
            </b-select>
          </b-field>
        </div>
        <div
          class="column"
        >
          <b-field
            label="What style of room?"
          >
            <b-select
              v-model="style"
              placeholder="Select style"
              :disabled="!selectedDorm"
              required
            >
              <option
                v-for="possibleStyle in possibleStyles"
                :key="possibleStyle"
                :value="possibleStyle"
              >
                {{ possibleStyle }}
              </option>
            </b-select>
          </b-field>
        </div>
        <div class="column is-narrow">
          <input
            type="submit"
            class="button is-dark"
            value="Submit for Approval"
          >
        </div>
      </div>
    </form>
  </b-modal>
</template>

<script>
export default {
  name: 'SubmitPhotoModal',
  props: {
    open: { type: Boolean, required: true },
    allDorms: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      photo: null,
      dormKey: '',
      style: ''
    }
  },
  computed: {
    photoNameTrimmed () {
      if (!this.photo) {
        return ''
      } else if (this.photo.name.length > 25) {
        return this.photo.name.slice(0, 25) + '...'
      }

      return this.photo.name
    },
    categorizedDorms () {
      const catergories = {}
      for (const dorm of this.allDorms) {
        catergories[dorm.grade] = catergories[dorm.grade] || []
        catergories[dorm.grade].push(dorm)
      }

      return catergories
    },
    selectedDorm () {
      return this.allDorms.find(dorm => dorm.key === this.dormKey)
    },
    possibleStyles () {
      return this.selectedDorm ? this.selectedDorm.styles : []
    }
  },
  watch: {
    '$route' (newRoute) {
      this.dormKey = newRoute.params.dormKey
      if (this.selectedDorm && this.selectedDorm.styles.length === 1) {
        this.style = this.selectedDorm.styles[0]
      }
    }
  },
  methods: {
    emitSubmit (event) {
      this.$emit('submit-photo', { photo: this.photo, dormKey: this.dormKey, style: this.style })
      this.photo = null
      this.dormKey = ''
      this.style = ''
    }
  }
}
</script>

<style lang="scss" scoped>

</style>

<style>
.dorm-select {
  text-transform: capitalize;
}
</style>
