<template>
  <div class="about">
    <section class="section">
      <h1 class="is-size-2 title">
        Welcome to LATE
      </h1>
      <div class=" column is-two-thirds">
        <div class="columns about">
          <img src="/availability.png">
          <p class="right">
            Tell us when you would like to work.
          </p>
        </div>

        <div class="columns about">
          <p class="left">
            Easily add your RPI class schedule by letting us grab the information from SIS. No more manual schedule setting. Reimport your schedule when you add or drop a class and we take care of the rest.
          </p>
          <img src="/importSchedule.png">
        </div>


        <div class="columns about">
          <p class="left">
            Quickly be able to add, edit, and delete assignments for your classes.
          </p>
          <img src="/addAssignments.png">
        </div>

        <div class="columns about">
          <img src="/upcomingAssignments.png">
          <p class="right">
            See a clear list of all upcoming assignments and tests.
          </p>
        </div>

        <div class="columns about">
          <img src="/dailyWorkSchedule.png">
          <p class="right">
            See a clear layout of your day! Just follow the list and let yourself be the lazy student you always dreamed of.
          </p>
        </div>

        <div class="columns about">
          <img src="/notify.png">
          <p class="right">
            We will notify you when it is time to work. You wont ever have to think about whether or not you <i>should</i> be working on something
          </p>
        </div>/
      </div>


      <!--
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
      </div> -->
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
  .columns{
    .left{
      margin-left:-60px;
      margin-right:2em !important;
      text-align:right;
    }
    .right{
      margin-right:-60px;
      margin-left: 2em !important;
    }
    .about{
      margin-bottom:8em;

      p{
        color: #4a4a4a;
        font-weight: 400;
        font-size: larger;
      }
      img{
        width:75%;
        height:75%;
      }
    }
  }
</style>
