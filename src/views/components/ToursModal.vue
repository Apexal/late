<template>
  <b-modal
    has-modal-card
    class="modal tours-modal"
    :active="open"
    @close="$emit('close-modal')"
  >
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Feature Tours
        </p>
      </header>
      <section class="modal-card-body">
        <div
          v-for="(tour, index) in tours"
          :key="index"
          class="panel-block tour"
          @click="startTour(index)"
        >
          {{ tour.title }}
        </div>
      </section>
      <footer class="modal-card-foot">
        <b-button @click="$emit('close-modal')">
          Close
        </b-button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'ToursModal',
  props: {
    open: { type: Boolean, required: true }
  },
  computed: {
    tours () {
      return this.$store.state.tours.tours;
    }
  },
  methods: {
    startTour (index) {
      const tour = this.tours[index];

      if (tour.route) this.$router.push(tour.route);
      this.$store.commit('TOGGLE_TOURS_MODAL');
      this.$store.commit('SET_TOUR_INDEX', index);
    }
  }
};
</script>

<style lang="scss" scoped>
.modal-card-body {
  padding: 0;
}

.panel-block.tour {
  cursor: pointer;
}
</style>
