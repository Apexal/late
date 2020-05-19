<!-- Promo page-->
<template>
  <div
    class="what-the"
    @mousemove="mouseMove"
  >
    <div
      ref="splash"
      class="splash"
    />
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

      <p id="sis-man-holder">
        <img
          :style="sisManStyle"
          title="Better LATE than never!"
          src="@/assets/img/sisman.png"
          @click="clickedSISMan"
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
          <b>LATE</b> is an open-source academic hub, planner, and coordinator, designed for RPI students. Launching in
          <b>Summer 2020.</b>
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
            Log in with CAS</a>
          <button
            class="the-other-button button is-secondary is-large"
            title="What exactly is LATE?"
            @click="scrollToPromos"
          >
            <span class="icon">
              <i class="fas fa-chevron-down" />
            </span>

            Learn More
          </button>
        </p>
      </div>
    </section>
    <section
      v-for="(promo, index) in promos"
      :id="'promo-' + index"
      :key="index"
      class="hero is-small promo"
      :class="promo.type || 'is-primary'"
    >
      <div class="hero-body">
        <div class="container">
          <div class="columns is-vcentered">
            <div class="column text-column">
              <h1 class="title">
                {{ promo.title }}
              </h1>
              <h2 class="subtitle">
                {{ promo.description }}
              </h2>
            </div>
            <div class="column example-column">
              <img
                v-if="promo.imageName"
                class="example"
                :src="'/img/promos/' + promo.imageName"
              >
              <div
                v-else-if="promo.videoName"
                class="example"
              >
                <video muted>
                  <source
                    :src="'/video/promos/' + promo.videoName + '.webm'"
                    type="video/webm"
                  >
                  <source
                    :src="'/video/promos/' + promo.videoName + '.mp4'"
                    type="video/mp4"
                  >
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ConfettiGenerator from 'confetti-js'
import { setTimeout, setInterval } from 'timers'

export default {
  name: 'ThePromoPage',
  data () {
    return {
      testers: 0,
      waitlist: 0,
      sisManClicks: 0,
      splashMovementStrength: 10,
      interval: null,
      promos: [
        {
          type: 'is-dark',
          title: 'Login with your RPI account',
          description: 'No need to make an account! Plus, you don\'t need to tell us your name or major or course schedule! Let us grab that from SIS for you! Once that is done you can manually change and add any information we have on you.',
          videoName: 'sis'
        },
        {
          type: 'is-info',
          title: 'Manage your entire courseload',
          description: 'Just tell LATE what assignments and tests you have and it will handle the rest. You\'ll always have a clear overview of everything you need to do. View your upcoming work in clear categories, in calendar form, or in list form. View statistics on your progress and study/work activities.',
          videoName: 'coursework'
        },
        {
          type: 'is-primary',
          title: 'Get notified to study/work',
          description: 'Connect to SMS, Discord, Google Calendar, and more to receive reminders and manage your courseload. Chat with our bots to manage your work. Customize when you want to be reached out to and when you want to receive summaries of your progress along with recommendations.',
          videoName: 'reminders'
        },
        {
          type: 'is-success',
          title: 'Completely Mobile-Friendly',
          description: 'LATE is designed for easy use on mobile devices- even while offline! Select "Install LATE" or "Add to Home Screen" for even more mobile functionality!',
          imageName: 'mobiledevices.png'
        },
        {
          type: 'is-warning',
          title: 'Use integrated student tools',
          description: 'Use LATE\'s grade calculators, work timers, and more tools which integrate with your courses and courseload. You don\'t even need to use LATE to use them!',
          videoName: 'tools'
        },
        {
          type: 'is-danger',
          title: 'And much, much more!',
          description: 'New features are constantly being added to LATE by the student team that works on it! We add features that solve the problems we encounter each day on campus. If you are a developer, contribute to the repo. If you are not, suggest new features directly!',
          videoName: 'issues'
        }
      ]
    }
  },
  computed: {
    waitlisted () {
      return !!this.$route.query.waitlisted
    },
    sisManStyle () {
      return {
        transform: `scale(${1 + Math.pow(this.sisManClicks, 2) / 100})`
      }
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

    this.interval = setInterval(this.activateVideosInView, 300)
  },
  beforeRouteLeave () {
    clearInterval(this.interval)
    this.interval = null
  },
  methods: {
    clickedSISMan () {
      this.sisManClicks += 1
      if (this.sisManClicks === 10) {
        alert('He approaches...')
      } else if (this.sisManClicks === 25) {
        alert('Resistance is futile...')
      } else if (this.sisManClicks === 100) {
        alert('Have you done your homework...')
      } else if (this.sisManClicks === 150) {
        // reward them with ???
      }
    },
    async getCounts () {
      const request = await this.$http.get('/students/counts')
      this.testers = request.data.testers
      this.waitlist = request.data.waitlist
    },
    mouseMove (e) {
      if (!this.$refs.splash) return

      const width = this.splashMovementStrength / window.innerWidth
      const height = this.splashMovementStrength / window.innerHeight

      const pageX = e.pageX - window.innerWidth / 2
      const pageY = e.pageY - window.innerHeight / 2

      const newValueX = width * pageX * -1
      const newValueY = height * pageY * -1

      this.$refs.splash.style.backgroundPositionX = newValueX + 'px'
      this.$refs.splash.style.backgroundPositionY = newValueY + 'px'
    },
    scrollToPromos () {
      document.getElementById('promo-0').scrollIntoView({
        behavior: 'smooth'
      })
    },
    activateVideosInView () {
      const promos = document.querySelectorAll('.promo')

      let found = false
      for (const promoEl of promos) {
        const boundingBox = promoEl.getBoundingClientRect()
        if ((boundingBox.top > 0 && boundingBox.bottom < window.innerHeight) || (boundingBox.top < 0 && boundingBox.bottom > window.innerHeight)) {
          promoEl.classList.add('active')
          const videoEl = promoEl.querySelector('video')
          if (!videoEl || videoEl.playing) continue

          // Edge doesn't return a promise
          const promise = videoEl.play()
          if (promise !== undefined) {
            promise
              .then(_ => {})
              .catch(_ => {})
          }

          found = promoEl
        }
      }

      if (!found) {
        // Find next closest
        for (const promoEl of promos) {
          const boundingBox = promoEl.getBoundingClientRect()
          if (boundingBox.top > 0 && boundingBox.bottom < window.innerHeight) {
            promoEl.classList.add('active')
            const videoEl = promoEl.querySelector('video')
            if (!videoEl || videoEl.playing) continue

            // Edge doesn't return a promise
            const promise = videoEl.play()
            if (promise !== undefined) {
              promise
                .then(_ => {})
                .catch(_ => {})
            }

            found = promoEl
          }
        }
      }

      if (!found) {
        // Find next closest
        for (const promoEl of promos) {
          const boundingBox = promoEl.getBoundingClientRect()
          if (boundingBox.bottom < window.innerHeight) {
            promoEl.classList.add('active')
            const videoEl = promoEl.querySelector('video')
            if (!videoEl || videoEl.playing) continue

            // Edge doesn't return a promise
            const promise = videoEl.play()
            if (promise !== undefined) {
              promise
                .then(_ => {})
                .catch(_ => {})
            }

            found = promoEl
          }
        }
      }

      for (const promoEl of promos) {
        if (promoEl === found) continue

        promoEl.classList.remove('active')
        const videoEl = promoEl.querySelector('video')
        if (!videoEl) continue

        if (videoEl.playing) {
          videoEl.pause()
        }

        videoEl.currentTime = 0
      }
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
  min-height: 95vh;

  padding: 0px !important;
  span.icon {
    margin-right: 0 !important;
  }
}

.splash {
  position: fixed;
  width: 120vw;
  left: 0;
  top: 20px;
  margin-left: -10vw;
  height: 500px;
  z-index: -1;
  background: url(/splash-bg.png);
  background-size: cover;
  background-repeat:no-repeat;
  height: 100%;
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
    // pointer-events: none;
    transform-origin: 100px 0;
    z-index: 1000;
    transition: transform 0.5s;
  }

  img:hover {
    transform: rotate(10deg);
  }

  img.flipped {
    transform: rotate3d(1, 1, 1, 45deg);
  }
}

// #sis-man-holder:hover {
//   img {
//     transform: rotate(-5deg);
//   }
// }

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

.promo-container .desc-container {
  margin: 0 auto;
  margin-top: 10px;
  background-color: white;
  padding: 30px;
  padding-top: 20px;
  max-width: 800px;
  border-radius: 10px;

  p.desc {
    font-size: 1.2em;
    padding: 15px 0;
  }
}

.promo {
  padding-top: 50px;
  padding-bottom: 50px;
  transition: 0.2s;
  text-align: center;
  //cursor:url('/img/icons/favicon.ico'), auto;

  .title {
    font-size: 3em;
  }

  .subtitle {
    font-size: 1.5em;
  }

  .example {
    border-radius: 10px;
    overflow: hidden;
    transform: scale(0.97);
    transition: transform 0.2s;
    display: inline-flex;
  }

  &.active .example {
    transform: scale(1);
  }

  .example-column {
    text-align: center;
  }

  .text-column {
    text-align: right;

    @media only screen and (max-width: 768px) {
      text-align: center !important;
    }
  }

  &:nth-child(even) .columns {
    flex-direction: row-reverse;
    .text-column {
      text-align: left;
    }
  }
}

.promo:last-child {
  margin-bottom: -30px;
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
