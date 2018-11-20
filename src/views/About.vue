<template>
  <div class="about">
    <section class="section">
      <div id="goal">
        <div class="content">
          <h1 class="title is-4">The Goal</h1>
          <p>To provide the user with a clear list of all upcoming assignments and tests.</p>
          <p>To automatically allocate free time in a user’s calendar to work on/study for assignments/tests.</p>
          <p>To remind users to follow the allocated study/work times through means including notifications, text messages, etc.</p>
          <p>To account for missing scheduled work by reallocating work times</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div id="team">
        <div class="content">
          <h1 class="title is-4">The Team</h1>
          <h4 class="subtitle">Project Contributors</h4>
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
  name: 'About',
  data () {
    return {
      contributors: ['Frank Matranga', 'Christie Nero', 'Abigail Medina', 'Bowen Wang', 'Ziyi Wang', 'Seth Laurenceau', 'Zach Love', 'Kikiola Sanusi', 'Tyler Machado']
    };
  }
};
</script>

