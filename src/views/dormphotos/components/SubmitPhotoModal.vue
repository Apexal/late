<template>
  <b-modal
    :active="open"
    @close="$emit('close-modal')"
  >
    <form
      class="box submit-photo"
      @submit.prevent="emitSubmit"
    >
      <div class="columns">
        <div class="column">
          <b-field label="Choose the photo">
            <b-input
              type="file"
              name="photo"
              accept="image/*"
              required
            />
          </b-field>
        </div>
        <div class="column">
          <b-field label="What dorm?">
            <b-select
              v-model="dormKey"
              placeholder="Select dorm"
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
          <b-field label="What style of room?">
            <b-select
              v-model="style"
              placeholder="Select style"
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
      </div>

      <input
        type="submit"
        class="button is-dark"
        value="Submit for Approval"
      >
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
      dormKey: '',
      style: ''
    }
  },
  computed: {
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
    }
  },
  methods: {
    emitSubmit (event) {
      this.$emit('submit-photo', { photo: event.target.photo.files[0], dormKey: this.dormKey, style: this.style })
      this.dormKey = ''
      this.style = ''
    }
  }
}
</script>

<style lang="scss" scoped>
option {
  text-transform: capitalize;
}
</style>
