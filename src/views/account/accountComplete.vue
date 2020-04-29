<!--Start setup page-->

<template>
  <div class="account-complete">
    <h2 class="is-size-3 has-text-centered title">
      What's Next?
    </h2>
    <h1 class="is-size-5 has-text-centered subtitle">
      Take some (optional) tours and get familiar with how
      <b>LATE</b> can help you manage your academic life
    </h1>
    <br>

    <div class="tile is-ancestor">
      <div class="tile">
        <div class="tile is-parent is-vertical">
          <div
            tag="article"
            class="tile is-child tools-button notification"
            @click="startTour(0)"
          >
            <i class="fas fa-bars" />
            <p class="title">
              Sidebar
            </p>
            <p class="subtitle">
              The one-stop-shop for your courses, work, and schedule.
            </p>
          </div>
          <div
            tag="article"
            class="tile is-child tools-button notification"
            @click="startTour(1)"
          >
            <i class="fas fa-bars" />
            <p class="title">
              Navbar
            </p>
            <p class="subtitle">
              All your tools and resources in one place.
            </p>
          </div>
        </div>
        <div class="tile is-parent is-vertical">
          <div
            tag="article"
            class="tile is-child tools-button notification"
            @click="startTour(2)"
          >
            <i class="fas fa-calendar" />
            <p class="title">
              Dashboard
            </p>
            <p class="subtitle">
              The main calendar page.
            </p>
          </div>
          <div
            tag="article"
            class="tile is-child tools-button notification"
            @click="startTour(3)"
          >
            <i class="fas fa-pencil-alt" />
            <p class="title">
              Assignments
            </p>
            <p class="subtitle">
              Editing and managing your coursework.
            </p>
          </div>
        </div>
        <div class="tile is-parent is-vertical">
          <div
            tag="article"
            class="tile is-child tools-button notification"
            @click="startTour(4)"
          >
            <i class="fas fa-calculator" />
            <p class="title">
              GPA Calculator
            </p>
            <p class="subtitle">
              Estimating your cumulative grades.
            </p>
          </div>
          <div
            tag="article"
            class="tile is-child tools-button notification"
            @click="startTour(5)"
          >
            <i class="fas fa-calculator" />
            <p class="title">
              Course Grade Calculator
            </p>
            <p class="subtitle">
              Keeping on top of your course grades.
            </p>
          </div>
        </div>
      </div>
    </div>
    <h2 class="subtitle is-size-4 has-text-grey-lighter has-text-centered">
      Site tours available at any time in
      <b>Account</b> dropdown.
    </h2>
    <router-link
      class="button is-medium is-primary"
      :to="{name: 'dashboard-calendar'}"
    >
      Start using
      <b>LATE</b>
    </router-link>
  </div>
</template>

<script>
// startTour takes index instead of name.
// Indexes: Sidebar, Navbar, Dashboard, Assignment, GPA, Course Grade
export default {
  name: 'AccountComplete',
  computed: {
    tours () {
      return this.$store.state.tours.tours
    }
  },
  methods: {
    startTour (index) {
      const tour = this.tours[index]

      if (tour.route) this.$router.push(tour.route)
      this.$store.commit('SET_TOUR_INDEX', index)
    }
  }
}
</script>

<style lang="scss" scoped>
.integration-note {
  text-align: center;
  padding: 1.5em 0 1em 0;
  max-width: 1000px;
  margin: 0 auto;
}

/*Centers and resizes button*/
.button {
  margin: 0 auto;
  display: block;
  max-width: 500px;
  height: 3em;
  line-height: 2em;
}

/*Button stylings*/
.tools-button i {
  position: absolute;
  right: 30px;
  font-size: 3.5em;
  opacity: 0.1;
  color: rgba(0, 0, 0, 0.4);
}

.tools-button {
  background: none;
  border: 1px solid rgba(224, 224, 224, 0.8);
  border-radius: 5px;
  color: black;
  display: block;
  font-size: 1.6em;
  font-weight: bold;
  position: relative;
  cursor: pointer;
  max-width: 650px;
}

.tools-button,
.tools-button::after,
.tools-button i {
  transition: all 0.1s;
}

.tools-button:hover {
  color: white;
  background: #2e3b59;
}

.tools-button:hover i {
  color: rgba(255, 255, 255, 0.6);
  opacity: 0.3;
}
</style>
