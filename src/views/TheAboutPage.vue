<template>
  <div class="about">
    <h1 class="is-size-2 page-header">
      About Us
    </h1>
    <div class="columns">
      <section class="section">
        <div id="goal">
          <div class="content column is-two-third">
            <h1 class="title is-4">
              The Goal
            </h1>
            <p>To provide the user with a clear list of all upcoming assignments and tests.</p>
            <p>To automatically allocate free time in a user’s calendar to work on/study for assignments/tests.</p>
            <p>To remind users to follow the allocated study/work times through means including notifications, text messages, etc.</p>
            <p>To account for missing scheduled work by reallocating work times</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div id="team">
          <div class="content column is-one-half">
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
  </div>
</template>

<script>
export default {
  name: 'TheAboutPage',
  data () {
    return {
      contributors: ['Frank Matranga', 'Christie Nero', 'Abigail Medina', 'Bowen Wang', 'Ziyi Wang', 'Seth Laurenceau', 'Zach Love', 'Kikiola Sanusi', 'Tyler Machado']
    };
  }
};
</script>

<style lang="scss" scoped>
.page-header {
  margin: 3rem 0rem 0rem 0rem;
  position: absolute; //I'M SORRY
  width: 100%;
  left: 0px;
  text-align: center;
}
//Pads out about section to fit in the space better
.about .section {
  padding: 8rem 2rem 2rem 2rem;
  max-width: 45vw;
  margin: 0 auto;

  .goal {
    text-align: center;
  }
}
</style>
