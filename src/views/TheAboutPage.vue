<template>
  <div class="about">
    <section class="section">
      <h1 class="is-size-2 title">
        About Us
      </h1>
      <div class="columns">
        <div
          id="goal"
          class="content column is-two-thirds"
        >
          <h1 class="title is-4">
            The Goal
          </h1>
          <p>To provide the user with a clear list of all upcoming assignments and tests.</p>
          <p>To automatically allocate free time in a user’s calendar to work on/study for assignments/tests.</p>
          <p>To remind users to follow the allocated study/work times through means including notifications, text messages, etc.</p>
          <p>To account for missing scheduled work by reallocating work times</p>
        </div>
        <div
          id="team"
          class="content column"
        >
          <h1 class="title is-4">
            The Team
          </h1>
          <h4 class="subtitle">
            Project Contributors
          </h4>
          <ul>
            <li
              v-for="c in contributors"
              :key="c"
            >
              {{ c }}
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'TheAboutPage',
  data () {
    return {
      contributors: [
        'Frank Matranga',
        'Zach Love',
        'Abigail Medina',
        'Christie Nero',
        'Tyler Machado',
        'Jose A Figueroa',
        'Alexandra Rachiele',
        'Anglea Lopez',
        'Henry Heffernan',
        'Colton Zecca',
        'Alex Ford',
        'Jose Deantes',
        'Sam Fawcett'
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
</style>
