<template>
  <div class="home">
    <TheDashboard v-if="loggedIn" />
    <section
      v-else
      class="section"
    >
      <div
        v-if="waitlisted"
        class="notification is-info"
      >
        <b>WAIT LIST</b> You are currently on the wait list and will be notified by email once LATE opens to the student body. Reach out to the <a href="mailto:matraf@rpi.edu">
          project lead
        </a> if you have any questions, or join the <a
          target="_blank"
          href="https://discord.gg/2GUKcHg"
        >
          Discord server.
        </a>
      </div>
      <div
        v-else
        class="notification is-warning"
      >
        <b>NOTICE:</b>&nbsp;<b>LATE</b> will soon be switching to closed BETA. New users will have to reach out to the <a href="mailto:matraf@rpi.edu">
          Project Head
        </a> to request access as a BETA tester.
      </div>
      <h1
        class="is-size-2 title"
        style="text-align: center"
      >
        Welcome to LATE
      </h1>
      <hr>
      <div
        class="column"
        style="margin-left: 10em; max-width: 50em;"
      >
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
          <img src="/addAssignments.png">
          <p class="right">
            Quickly be able to add, edit, and delete assignments for your classes.
          </p>
        </div>

        <div class="columns about">
          <p class="left">
            See a clear list of all upcoming assignments and tests.
          </p>
          <img src="/upcomingAssignments.png">
        </div>

        <div class="columns about">
          <img src="/dailyWorkSchedule.png">
          <p class="right">
            See a clear layout of your day! Just follow the list and let yourself be the lazy student you always dreamed of.
          </p>
        </div>

        <div class="columns about">
          <p class="left">
            We will notify you when it is time to work. You won't ever have to think about whether or not you <i>should</i> be working on something
          </p>
          <img src="/notify.png">
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import TheDashboard from '@/views/TheDashboard';

export default {
  name: 'TheHomePage',
  components: { TheDashboard },
  computed: {
    loggedIn () { return this.$store.state.auth.isAuthenticated; },
    waitlisted () {
      return !!this.$route.query.waitlisted;
    }
  }
};
</script>


<style lang="scss" scoped>
  hr{
    margin:3em;
    background-color:darkgrey;
  }
  .title{
    text-align:center;
  }
  .columns{
    .left{
      margin-right:2em !important;
      text-align:right;
    }
    .right{
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

