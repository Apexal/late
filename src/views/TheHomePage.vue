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
        <b>LATE</b> is currently in closed BETA and is not available to the general student body yet. Interested students can be added to the wait list by <a href="/auth/login">
          logging in
        </a> and will be notified as soon as the website is ready to publicly launch.
      </div>
      <h1
        class="is-size-2 title"
        style="text-align: center"
      >
        Welcome to LATE
      </h1>
      <h2 class="subtitle has-text-grey has-text-centered">
        <b>{{ testers }}</b> Current Testers
        |
        <b>{{ waitlist }}</b> {{ waitlist === 1 ? 'Student' : 'Students' }} on Wait List
      </h2>
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
import { setTimeout } from 'timers';

export default {
  name: 'TheHomePage',
  components: { TheDashboard },
  data () {
    return {
      testers: 0,
      waitlist: 0
    };
  },
  computed: {
    loggedIn () { return this.$store.state.auth.isAuthenticated; },
    waitlisted () {
      return !!this.$route.query.waitlisted;
    }
  },
  async created () {
    await this.getCounts();
    setTimeout(this.getCounts, 1000 * 60 * 15); // 15 minutes
  },
  methods: {
    async getCounts () {
      let request = await this.$http.get('/students/counts');
      this.testers = request.data.testers;
      this.waitlist = request.data.waitlist;
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

