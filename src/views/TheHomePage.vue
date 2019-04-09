<template>
  <div class="home">
    <TheDashboard v-if="loggedIn" />
    <section
      v-else
      class="section"
      style="margin-top: 24px"
    >
      <div
        v-if="waitlisted"
        class="notification is-info"
      >
        <b>WAIT LIST</b> You are currently on the wait list and will be notified by email once LATE opens to the student body. Reach out to the
        <a
          href="mailto:matraf@rpi.edu"
        >project lead</a> if you have any questions, or join the
        <a
          target="_blank"
          href="https://discord.gg/2GUKcHg"
        >Discord server.</a>
      </div>
      <p id="sis-man-holder">
        <img
          src="https://camo.githubusercontent.com/ce3710480c5f51df1d3ac2b6c3c231b22709ead2/687474703a2f2f656e672e7270692e6564752f73697465732f64656661756c742f66696c65732f5349534d616e5f302e706e67"
        >
      </p>

      <h1
        class="is-size-1 title"
        style="text-align: center"
      >
        Welcome to LATE
      </h1>

      <h2 class="subtitle has-text-grey has-text-centered">
        <b>{{ testers }}</b> Current Testers
        |
        <b>{{ waitlist }}</b>
        {{ waitlist === 1 ? 'Student' : 'Students' }} on Wait List
      </h2>
      <p
        class="is-size-8 has-text-centered"
        style="max-width:800px;margin:0 auto;"
      >
        <b>LATE</b> is currently in closed BETA and is not available to the general student body yet. Interested students can be added to the wait list by logging in and will be notified as soon as the website is ready to publicly launch.
      </p>

      <p class="has-text-centered">
        <a
          href="/auth/login"
          class="join-beta button is-primary is-large"
          title="Log in to LATE beta"
        >Log in</a>
      </p>
      <hr>
      <div
        class="columns is-multiline"
        style="margin: 0 auto; max-width: 80vw;"
      >
        <div class="column is-third">
          <h2 class="is-size-3 title">
            Tell us when you would like to work.
          </h2>
          <h3
            class="is-size-6 tagline"
          >
            Not everybody's a workaholic. Late will adjust itself to fit other committments, your social life, or just you time :)
          </h3>
          <img
            class="example"
            src="/availability.png"
          >
        </div>
        <div class="column is-third">
          <h2 class="is-size-3 title">
            Import schedule from SIS.
          </h2>
          <h3
            class="is-size-6 tagline"
          >
            No more manual scheduling. LATE grabs your classes automatically using your SIS login for hassle-free setup. Reimport your schedule when you add or drop a class and we take care of the rest.
          </h3>
          <img
            class="example"
            src="/importSchedule.png"
          >
        </div>
        <div class="column is-third">
          <h2 class="is-size-3 title">
            See a clear layout of your day.
          </h2>
          <h3
            class="is-size-6 tagline"
          >
            All of your classes at a glance. Be the lazy student you always dreamed of.
          </h3>
          <img
            class="example"
            src="/dailyWorkSchedule.png"
          >
        </div>
        <div class="column is-third">
          <h2 class="is-size-3 title">
            Keeps track of upcoming assignments and tests.
          </h2>
          <h3
            class="is-size-6 tagline"
          >
            No more planners or fiddling with syllabi. LATE helps you stay on top of your work.
          </h3>
          <img
            class="example"
            src="/upcomingAssignments.png"
          >
        </div>
        <div class="column is-third">
          <h2 class="is-size-3 title">
            Add, edit, and remove assignments and exams.
          </h2>
          <h3 class="is-size-6 tagline">
            Quickly edit and remove assessments from your calendar.
          </h3>
          <img
            class="example"
            src="/addAssignments.png"
          >
        </div>
        <div class="column is-third">
          <h2 class="is-size-3 title">
            Be notified when it's time to work.
          </h2>
          <h3
            class="is-size-6 tagline"
          >
            Using integrations like SMS, email, and Discord, LATE will automatically remind you of scheduled study blocks and upcoming work.
          </h3>
          <img
            class="example"
            src="/notify.png"
          >
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
    loggedIn () {
      return this.$store.state.auth.isAuthenticated;
    },
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
#sis-man-holder {
  text-align: center;
  img {
    width: 250px;
  }
}

.join-beta {
  margin-top: 25px;
}

hr {
  margin: 3em;
  background-color: darkgrey;
}
.title {
  text-align: center;
}

.columns {
  text-align: center;
  max-width: 95vw;

  .column {
    padding: 10px 20px 10px 20px;
    min-width: 350px; //Adjust number of columns on devices.
    margin: 10px;

    //Copied "box" styles
    background-color: #fff;
    border-radius: 6px;
    -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1),
      0 0 0 1px rgba(10, 10, 10, 0.1);
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    color: #4a4a4a;
    transition: 0.2s;
    -webkit-transition: 0.2s;

    //Example images
    .example {
      width: 100%;
      height: auto;
    }

    .title {
      margin-bottom: 5px;
    }

    .tagline {
      margin-bottom: 10px;
      height: 6.7em; //Standardizes height so image offset is the same
    }
  }

  .column:hover {
    -webkit-box-shadow: 2px 3px 5px rgba(10, 10, 10, 0.3),
      0 0 0 1px rgba(10, 10, 10, 0.1);
    box-shadow: 2px 3px 5px rgba(10, 10, 10, 0.3),
      0 0 0 1px rgba(10, 10, 10, 0.1);
    transition: 0.2s;
    -webkit-transition: 0.2s;
  }
}
</style>

