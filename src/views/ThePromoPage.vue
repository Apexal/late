<template>
  <section
    class="promo-container section"
    style="margin-top: 24px"
  >
    <b-notification
      v-if="waitlisted"
      type="is-info"
    >
      <b>WAIT LIST</b> You are currently on the wait list and will be notified
      by email once LATE opens to the student body. Reach out to the
      <a href="mailto:matraf@rpi.edu">project lead</a> if you have any
      questions, or join the
      <a
        target="_blank"
        href="https://discord.gg/2GUKcHg"
      >Discord server.</a>
    </b-notification>
    <div class="splash" />
    <p id="sis-man-holder">
      <img
        title="Better LATE than never!"
        src="/sisman.png"
      >
    </p>

    <h1
      class="is-size-1 title main-title"
      style="text-align: center"
    >
      Welcome to LATE
    </h1>

    <h2 class="subtitle main-subtitle has-text-grey has-text-centered">
      <b>{{ testers }}</b> Current Testers |
      <b>{{ waitlist }}</b>
      {{ waitlist === 1 ? "Student" : "Students" }} on Wait List
    </h2>
    <div class="desc-container">
      <p
        class="is-size-8 has-text-centered desc"
        style="max-width:800px;margin:0 auto;"
      >
        <b>LATE</b> is currently in closed BETA and is not available to the
        general student body yet. Interested students can be added to the wait
        list by logging in and will be notified when we publicly launch in
        <b>Fall 2019.</b>
      </p>

      <p class="has-text-centered">
        <a
          href="/auth/login"
          class="join-beta button is-primary is-large"
          title="Log in to LATE beta"
        >Register</a>
        <a
          href="https://github.com/Apexal/late"
          class="the-other-button button is-secondary is-large"
          title="Check our our open-source repository"
        >GitHub</a>
      </p>
      <hr>
      <div
        class="columns is-multiline promos"
        style="margin: 0 auto; max-width: 80vw;"
      >
        <div class="column promo is-third">
          <h2 class="is-size-3 title">
            Tell us when you would like to work.
          </h2>
          <h3 class="is-size-6 tagline">
            Not everybody's a workaholic. Late will adjust itself to fit other
            committments, your social life, or just you time :)
          </h3>
          <img
            class="example"
            src="/availability.png"
          >
        </div>
        <div class="column promo is-third">
          <h2 class="is-size-3 title">
            Import schedule from SIS.
          </h2>
          <h3 class="is-size-6 tagline">
            No more manual scheduling. LATE grabs your classes automatically
            using your SIS login for hassle-free setup. Reimport your schedule
            when you add or drop a class and we take care of the rest.
          </h3>
          <img
            class="example"
            src="/importSchedule.png"
          >
        </div>
        <div class="column promo is-third">
          <h2 class="is-size-3 title">
            See a clear layout of your day.
          </h2>
          <h3 class="is-size-6 tagline">
            All of your classes at a glance. Be the lazy student you always
            dreamed of.
          </h3>
          <img
            class="example"
            src="/dailyWorkSchedule.png"
          >
        </div>
        <div class="column promo is-third">
          <h2 class="is-size-3 title">
            Keeps track of upcoming assignments and tests.
          </h2>
          <h3 class="is-size-6 tagline">
            No more planners or fiddling with syllabi. LATE helps you stay on
            top of your work.
          </h3>
          <img
            class="example"
            src="/upcomingAssignments.png"
          >
        </div>
        <div class="column promo is-third">
          <h2 class="is-size-3 title">
            Add, edit, and remove assignments and exams.
          </h2>
          <h3 class="is-size-6 tagline">
            Quickly edit and remove your assessments and tests with the click of
            a button.
          </h3>
          <img
            class="example"
            src="/addAssignments.png"
          >
        </div>
        <div class="column promo is-third">
          <h2 class="is-size-3 title">
            Be notified when it's time to work.
          </h2>
          <h3 class="is-size-6 tagline">
            Using integrations like SMS, email, and Discord, LATE will
            automatically remind you of scheduled study blocks and upcoming
            work.
          </h3>
          <img
            class="example"
            src="/notify.png"
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ThePromoPage',
  data () {
    return {
      testers: 0,
      waitlist: 0
    };
  },
  computed: {
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

<style lang="scss">
//Note: These styles are global. For some reason.

.homepage {
  margin: 0;
  width: 100%;
  max-width: unset;
}
.promo-container {
  padding: 0px !important;
}

.splash {
  position: fixed;
  width: 110vw;
  left: 0;
  top: 10px;
  margin-left: -10vw;
  height: 500px;
  z-index: -1;
  background: url(/splash-bg.png);
  background-size: cover;
  filter: blur(5px);
}

#sis-man-holder {
  text-align: center;
  margin-top: -20px;
  img {
    width: 250px;
    pointer-events: none;
    transition: transform 0.5s;
  }
}

#sis-man-holder:hover {
  img {
    transform: rotate(-5deg);
  }
}

#sis-man-holder,
.promo-container .title,
.promo-container .subtitle {
  margin: 0rem 1.5rem 0rem 1.5rem;
}

.join-beta,
.the-other-button {
  margin-top: 25px;
}
.join-beta {
  margin-right: 10px;
}

.promo-container hr {
  margin: 3em;
  background-color: darkgrey;
}

.main-title,
.main-subtitle {
  text-align: center;
  color: white !important;
  text-shadow: 0 1px 0 #52413c, 0px 0px 50px #52413c;
}

.promo-container .desc-container {
  background-color: white;
  border-radius: 10px;
  padding: 20px 10px;
}

.promos {
  text-align: center;
  max-width: 95vw;

  .promo {
    padding: 10px 20px 10px 20px;
    min-width: 270px; //Adjust number of columns on devices. 300+ breaks mobile.
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
