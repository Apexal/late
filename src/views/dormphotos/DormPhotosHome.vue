<template>
  <div class="dorm-photos-home">
    <div class="is-flex">
      <div class="buttons">
        <a
          class="button is-link"
          href="#freshman"
        >Freshman</a>
        <a
          class="button is-link"
          href="#sophomore"
        >Sophomore</a>
        <a
          class="button is-link"
          href="#junior"
        >Junior</a>
        <a
          class="button is-link"
          href="#senior"
        >Senior</a>
      </div>
      <b-field>
        <b-select v-model="sortBy">
          <option value="alphabetically">
            Sort Alphabetically
          </option>
          <option value="type">
            Sort by Type
          </option>
          <option value="styles">
            Sort by Styles
          </option>
        </b-select>
      </b-field>
      <hr>
    </div>
    <div
      v-for="(dorms, grade) in categorizedDorms"
      :id="grade"
      :key="grade"
    >
      <h2 class="subtitle grade">
        {{ grade }} Housing
        <small class="has-text-grey">{{ dorms.length }} dorms</small>
      </h2>

      <div class="columns is-multiline dorms">
        <div
          v-for="dorm in dorms"
          :key="dorm.key"
          class="column is-one-quarter dorm"
        >
          <div
            class="card"
          >
            <div class="card-image">
              <router-link
                :to="{name: 'dorm-photos-view', params: {dormKey: dorm.key}}"
              >
                <img
                  class="dorm-photo"
                  :src="dorm.imageURL"
                  alt="Picture of "
                >
                <b-tag
                  class="photo-count"
                >
                  20 photos
                </b-tag>
              </router-link>
            </div>
            <div class="card-content">
              <router-link
                :to="{name: 'dorm-photos-view', params: {dormKey: dorm.key}}"
                class="title is-size-4 has-text-centered"
                :title="dorm.description"
              >
                {{ dorm.name }}
              </router-link>
              <div class="dorm-info has-text-grey">
                <span class="dorm-type">{{ dorm.type }}</span>
                <br>
                <span class="dorm-styles">{{ dorm.styles.join('s, ') }}</span>
                <br>
                <a
                  :href="'https://sll.rpi.edu/buildings/' + dorm.key"
                  target="_blank"
                >Info, Amenities & Floor Plan</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DormPhotosHome',
  props: {
    allDorms: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      sortBy: 'alphabetically'
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
    }
  }
}
</script>

<style lang="scss" scoped>
.card-image {
  position: relative;

  .photo-count {
    position: absolute;
    top: 5px;
    right: 5px;
  }
}

.card-content {
  padding: 1rem;
  .title {
    margin-bottom: 12px;
  }
  .dorm-styles {
    text-transform: capitalize;
  }
}

.grade {
  text-transform: capitalize;
  font-size: 1.5rem;
}
</style>
