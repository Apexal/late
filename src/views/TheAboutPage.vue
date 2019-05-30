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
          <p>
            To provide the user with a clear list of all upcoming assignments
            and tests.
          </p>
          <p>
            To automatically allocate free time in a user’s calendar to work
            on/study for assignments/tests.
          </p>
          <p>
            To remind users to follow the allocated study/work times through
            means including notifications, text messages, etc.
          </p>
          <p>
            To account for missing scheduled work by reallocating work times
          </p>
        </div>
        <div
          id="team"
          class="content column"
        >
          <h1 class="title is-4">
            The Team
          </h1>
          <h4 class="subtitle has-text-grey">
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
    <section>
      <h1 class="title">
        Project Status Updates
      </h1>
      <iframe
        v-for="url in statusUpdateURLs"
        :key="url"
        width="600"
        height="700"
        :src="url"
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </section>
  </div>
</template>

<script>
export default {
  name: 'TheAboutPage',
  data () {
    return {
      statusUpdateURLs: [
        'https://www.youtube.com/embed/E3RLHVNB81w',
        'https://www.youtube.com/embed/FhRSjxgsArA',
        'https://www.youtube.com/embed/YaydQTjpBZE',
        'https://www.youtube.com/embed/aB93j7LUK0w'
      ],
      contributors: [
        'Frank Matranga',
        'Zach Love',
        'Christie Nero',
        'Abigail Medina',
        'Alexandra Rachiele',
        'Tyler Machado',
        'Colton Zecca',
        'Anglea Lopez',
        'Sam Fawcett',
        'Jose Deantes',
        'Gabe Benelli',
        'Henry Heffernan',
        'Seth Laurenceau',
        'Ziyi Wang',
        'Kikiola Sanusi'
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
iframe {
  min-height: 300px;
  height: 100%;
  max-height: 500px;

  margin-bottom: 20px;
}
</style>
