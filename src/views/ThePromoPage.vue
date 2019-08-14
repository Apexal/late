<!-- Promo page-->
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
        src="@/assets/img/sisman.png"
      >
    </p>

    <h1
      class="title main-title"
      style="text-align: center"
    >
      Welcome to LATE
    </h1>

    <p class="tester-count has-text-grey has-text-centered">
      <b-tag
        type="is-dark"
        class="counts"
        size="is-medium"
      >
        <b>{{ testers }}</b> Current Testers |
        <b>{{ waitlist }}</b>
        {{ waitlist === 1 ? "Student" : "Students" }} on Wait List
      </b-tag>
    </p>
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
        >
          <span class="icon">
            <i class="fas fa-sign-in-alt" />
          </span>
          Join Waitlist</a>
        <a
          href="https://github.com/Apexal/late"
          class="the-other-button button is-secondary is-large"
          title="Check our our open-source repository"
          target="_blank"
        >
          <span class="icon">
            <i class="fab fa-github" />

          </span>

          View Source</a>
      </p>
      <hr>
      <div
        class="columns is-multiline promos"
        style="margin: 0 auto; max-width: 80vw;"
      >
        <div
          v-for="(promo, index) in promos"
          :key="index"
          class="column is-one-third"
        >
          <div class="box has-background-dark promo">
            <h2 class="is-size-3 title">
              {{ promo.title }}
            </h2>
            <h3 class="is-size-6 description">
              {{ promo.description }}
            </h3>
            <img
              class="example"
              :src="'/img/promos/' + promo.imageName"
            >
          </div>
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
      waitlist: 0,
      promos: [
        {
          title: 'Import your info from SIS',
          description: 'You don\'t need to tell us your name or major or course schedule! Let us grab that for you!',
          imageName: 'availability.png'
        },
        {
          title: 'Manage your entire courseload',
          description: 'Just tell LATE what assignments and tests you have and it will handle the rest.',
          imageName: 'availability.png'
        },
        {
          title: 'Get notified to study/work',
          description: 'Connect to SMS, Discord, Google Calendar, and more to receive reminders and manage your courseload.',
          imageName: 'availability.png'
        },
        {
          title: 'Collaborate with your peers',
          description: 'Find students in your courses looking to form study groups, or create groups assignments that .',
          imageName: 'availability.png'
        },
        {
          title: 'Use integrated student tools',
          description: 'Use LATE\'s grade calculators, work timers, and more tools which integrate with your courses and courseload.',
          imageName: 'availability.png'
        },
        {
          title: 'And much, much more!',
          description: 'New features are constantly being added to LATE by the student team that works on it!',
          imageName: 'availability.png'
        }
      ]
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

.main-title {
  font-size: 4em;
}

.main-title,
.main-subtitle {
  text-align: center;
  color: white !important;
  text-shadow: 0 1px 0 #52413c, 0px 0px 50px #52413c;
}

.promo-container .desc-container {
  background-color: white;
  padding: 20px 10px;
}

.promos {

  max-width: 95vw;
  .promo {
    transition: 0.2s;
    text-align: center;
    cursor: pointer;

    .title {
      color: white;
    }

    img.example {
      border-radius: 6px;
      margin-top: 10px;
    }

    color: white;
  }

  .promo:hover {
    box-shadow: 2px 3px 5px rgba(10, 10, 10, 0.3),
      0 0 0 1px rgba(10, 10, 10, 0.1);

  }
}

.counts {
  margin-top: 20px;
  margin-bottom: -10px;
}

span.icon {
  margin-right: 0 !important;
}
</style>
