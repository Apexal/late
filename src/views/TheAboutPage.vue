<!--About page-->
<template>
  <section class="section">
    <h1 class="title">
      About LATE
    </h1>
    <div class="tile is-ancestor">
      <div class="tile is-8 is-vertical is-parent">
        <div class="tile is-child box">
          <div
            id="goal"
            class="content"
          >
            <h1 class="title is-4">
              The Goal
            </h1>
            <h4 class="subtitle has-text-grey">
              Making RPI a little less stressful
            </h4>
            <p>
              <b>LATE</b> is a free, open-source web app for RPI students that offers a variety of
              functions and tools to make your life at RPI a little less stressful.
              It manages all of your assignments and exams each semester, lets you
              schedule when you want to work/study for them, provides you with recommendations
              for working and studying, and keeps you on schedule by reaching out to you over SMS, Discord, or wherever you like!

              It can also connect to your Google Calendar to add your course schedule and sync the times you are scheduled to work/study
              on LATE with your Google Calendar!
            </p>
            <p>
              It also provides a handful of useful student tools for users and non-users such as grade calculators, a work/study timer,
              a move-in checklist creator, and more.
            </p>
          </div>
        </div>
        <div class="tile is-child box">
          <h1 class="title is-4">
            Status Updates
          </h1>
          <h4 class="subtitle has-text-grey">
            Check in with our development milestones
          </h4>
          <div class="tile is-parent status-updates">
            <div
              v-for="url in statusUpdateURLs"
              :key="url"
              class="iframe-container is-child is-6"
            >
              <iframe
                :key="url"
                width="600"
                height="700"
                :src="url"
                frameborder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>
          </div>
        </div>
      </div>
      <div class="tile is-parent is-vertical">
        <div class="tile is-child box">
          <h1 class="title is-4">
            The Team
          </h1>
          <h4 class="subtitle has-text-grey">
            Project Contributors
          </h4>
          <ul class="contrib-list">
            <li>
              <b-tag type="is-success">
                Project Lead
              </b-tag>
              Frank Matranga
            </li>
            <li
              v-for="c in contributors"
              :key="c"
            >
              <b-tag type="is-dark">
                Developer
              </b-tag>
              {{ c }}
            </li>
            <li
              v-for="t in testers"
              :key="t"
            >
              <b-tag type="is-primary">
                Tester
              </b-tag>
              {{ t }}
            </li>
          </ul>
        </div>
        <div class="tile is-child box">
          <h1 class="title is-4">
            Develop LATE
          </h1>
          <h4 class="subtitle has-text-grey">
            Get involved in development
          </h4>
          <ul>
            <li>
              <a href="https://github.com/Apexal/late/">Contribute on GitHub</a>
            </li>
            <li>
              <a
                href="https://rcos.io/projects/apexal/late/profile"
              >View us on Observatory</a>
            </li>
            <li>
              <a
                href="https://github.com/Apexal/late/wiki"
              >Read our development setup guide</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'TheAboutPage',
  data () {
    return {
      statusUpdateURLs: [
        'https://www.youtube.com/embed/E3RLHVNB81w',
        'https://www.youtube.com/embed/FhRSjxgsArA',
        'https://www.youtube.com/embed/YaydQTjpBZE',
        'https://www.youtube.com/embed/aB93j7LUK0w'
      ],
      contributors: [
        'Zach Love',
        'Christie Nero',
        'Abigail Medina',
        'Alexandra Rachiele',
        'Tyler Machado',
        'Colton Zecca',
        'Angela Lopez',
        'Sam Fawcett',
        'Jose Deantes',
        'Gabe Benelli',
        'Henry Heffernan',
        'Seth Laurenceau',
        'Ziyi Wang',
        'Kikiola Sanusi',
        'Bowen Wang'
      ],
      testers: [
        'Caitlin Bennett',
        'Sarah Tedesco',
        'Ben Sherman',
        'Hannah Lim',
        'Nishant Srivastava',
        'Dan Madras',
        'Stéfan Martin',
        'Lael Kutame',
        'Alice Varughese'
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  padding-bottom: 0px;
  padding-left: 0px;
  border-bottom-color: #dbdbdb;
  border-bottom-style: solid;
  border-bottom-width: 1px;
}

ul {
  list-style-type: none;
  margin-left: 20px;
}

//Disgusting way to tile iframes. Then again iframes are disgusting too.
.status-updates {
  display: flex;
  flex-wrap: wrap;
  margin: 0px;
  padding: 0px;
}

.status-updates .iframe-container {
  position: relative;
  overflow: hidden;
  max-width: 250px;
  flex: 1 1 auto;
}

.contrib-list {
  margin-left: 0;
}
</style>
