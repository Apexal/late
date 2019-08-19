<!-- Promo page-->
<template>
  <section
    class="promo-container section"
    style="margin-top: 24px"
  >
    <canvas id="confetti-canvas" />
    <b-notification
      v-if="waitlisted"
      class="waitlist-notification"
      type="is-info"
    >
      <b>WELCOME TO THE WAIT LIST</b> You are currently on the wait list and will be notified
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
        list below and will be notified when we publicly launch in
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
        <router-link
          :to="{name: 'about'}"
          class="the-other-button button is-secondary is-large"
          title="What exactly is LATE?"
        >
          <span class="icon">
            <i class="fas fa-info" />
          </span>

          Learn More
        </router-link>
      </p>
      <hr>
      <div
        class="columns is-multiline promos"
        style="margin: 0 auto; max-width: 80vw;"
      >
        <div
          v-for="(promo, index) in promos"
          :key="index"
          class="column is-one-third-fullhd is-half"
        >
          <div
            class="box is-unselectable promo"
            @mouseenter="promoMouseEnter"
            @mouseleave="promoMouseLeave"
          >
            <h2 class="is-size-3 title">
              {{ promo.title }}
            </h2>
            <h3 class="is-size-6 description">
              {{ promo.description }}
            </h3>
            <img
              v-if="promo.imageName"
              class="example"
              :src="'/img/promos/' + promo.imageName"
            >
            <div
              v-else-if="promo.videoName"
              class="example"
            >
              <video>
                <source
                  :src="'/video/promos/' + promo.videoName"
                  type="video/mp4"
                >
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import ConfettiGenerator from 'confetti-js'
import { setTimeout } from 'timers'

export default {
  name: 'ThePromoPage',
  data () {
    return {
      testers: 0,
      waitlist: 0,
      promos: [
        {
          title: 'Login with your RPI account',
          description: 'No need to make an account! Plus, you don\'t need to tell us your name or major or course schedule! Let us grab that from SIS for you!',
          videoName: 'SIS.mp4'
        },
        {
          title: 'Manage your entire courseload',
          description: 'Just tell LATE what assignments and tests you have and it will handle the rest. You\'ll always have a clear overview of everything you need to do.',
          videoName: 'coursework.mp4'
        },
        {
          title: 'Get notified to study/work',
          description: 'Connect to SMS, Discord, Google Calendar, and more to receive reminders and manage your courseload. Chat with our bots to manage your work.',
          videoName: 'reminders.mp4'
        },
        {
          title: 'Collaborate with your peers',
          description: 'Find students in your courses looking to form study groups, or create groups assignments to schedule group meetings to work. LATE will handle finding the rimes that work for everyone!',
          videoName: 'collaborate.mp4'
        },
        {
          title: 'Use integrated student tools',
          description: 'Use LATE\'s grade calculators, work timers, and more tools which integrate with your courses and courseload. You don\'t even need to use LATE to use them!',
          videoName: 'tools.mp4'
        },
        {
          title: 'And much, much more!',
          description: 'New features are constantly being added to LATE by the student team that works on it! We add features that solve the problems we encounter each day on campus.',
          imageName: 'availability.png'
        }
      ]
    }
  },
  computed: {
    waitlisted () {
      return !!this.$route.query.waitlisted
    }
  },
  async created () {
    await this.getCounts()
    setTimeout(this.getCounts, 1000 * 60 * 15) // 15 minutes
  },
  mounted () {
    if (this.waitlisted) {
      const confettiSettings = { target: 'confetti-canvas' }
      const confetti = new ConfettiGenerator(confettiSettings)
      confetti.render()
      setTimeout(() => confetti.clear(), 5000)
    }
  },
  methods: {
    async getCounts () {
      const request = await this.$http.get('/students/counts')
      this.testers = request.data.testers
      this.waitlist = request.data.waitlist
    },
    promoMouseEnter (e) {
      const videoEl = e.target.querySelector('video')
      if (!videoEl) return
      videoEl.play()
    },
    promoMouseLeave (e) {
      const videoEl = e.target.querySelector('video')
      if (!videoEl) return
      videoEl.pause()
      videoEl.currentTime = 0
    }
  }
}
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
  span.icon {
    margin-right: 0 !important;
  }
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
  //filter: blur(5px);
}

.tester-count {
  margin-top: -20px;
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
  margin: 2em 0;
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

.desc-container {
  margin-top: 10px;
}

.promo-container .desc-container {
  background-color: white;
  padding: 20px 10px;

  p.desc {
    font-size: 1.2em;
    padding: 15px 0;
  }
}

.promos {

  max-width: 90vw;
  .promo {
    transition: 0.2s;
    text-align: center;
    cursor: pointer;
    //cursor:url('/img/icons/favicon.ico'), auto;

    .example {
      //border: 2px solid white;
      border-radius: 6px;
      margin-top: 10px;
      overflow: hidden;

      video {
        filter: brightness(0.9);
        transition: filter 0.5s;
      }
    }

    &:hover {
      .example video {
        filter: brightness(1);
      }
    }

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

.waitlist-notification {
  margin: 0 20px;
}

#confetti-canvas {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  pointer-events: none;
}
</style>
