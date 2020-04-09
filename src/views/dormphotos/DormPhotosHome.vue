<template>
  <div class="dorm-photos-home">
    <div class="box is-flex">
      <div class="columns is-fullwidth">
        <div class="column">
          <nav class="breadcrumb grade-anchors">
            <ul>
              <li><a href="#freshman">Freshman</a></li>
              <li><a href="#sophomore">Sophomore</a></li>
              <li><a href="#junior">Junior</a></li>
              <li>
                <a href="#senior">Senior</a>
              </li>
            </ul>
          </nav>
        </div>

        <!-- <div class="column is-narrow">
          <b-select
            v-model="sortBy"
            disabled
          >
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
        </div> -->

        <div class="column is-narrow">
          <b-button
            type="is-dark"
            @click="$emit('open-submit-photo-modal')"
          >
            <i class="fas fa-camera" />
            Submit Photo
          </b-button>
        </div>
      </div>
    </div>
    <div
      v-for="(dorms, grade) in categorizedDorms"
      :id="grade"
      :key="grade"
    >
      <h2 class="subtitle has-text-centered has-text-bold grade">
        {{ grade }} Housing
        <small class="has-text-grey">{{ dorms.length }} dorms</small>
      </h2>

      <div class="columns is-multiline dorms">
        <div
          v-for="dorm in dorms"
          :key="dorm.key"
          class="column is-full is-one-quarter-desktop is-one-third-tablet dorm"
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
                  v-if="!loading"
                  class="photo-count"
                  :type="(counts[dorm.key] || 0) > 0 ? '' : 'is-danger'"
                >
                  {{ counts[dorm.key] || 0 }} photos
                </b-tag>
              </router-link>
            </div>
            <div class="card-content">
              <router-link
                :to="{name: 'dorm-photos-view', params: {dormKey: dorm.key}}"
                class="title is-size-4"
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
      loading: true,
      sortBy: 'alphabetically',
      counts: {}
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
  },
  mounted () {
    this.getDormCounts()
  },
  methods: {
    async getDormCounts () {
      this.loading = true

      let request
      try {
        request = await this.$http.get('/dormphotos', { params: { count: true } })
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      this.counts = request.data.counts

      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.grade-anchors {
  margin: 0;
}

.card-image {
  position: relative;

  .photo-count {
    position: absolute;
    top: 5px;
    right: 5px;
  }

  .dorm-photo {
    width: 100%;
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
  font-weight: bold;
  text-transform: capitalize;
  font-size: 1.5rem;
  display: inline-block;
  margin-bottom: 0.5em;
}
</style>
