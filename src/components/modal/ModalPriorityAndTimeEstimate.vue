<template>
  <div>
    <div class="columns">
      <div class="priority column">
        <label>Priority</label>
        <KnobControl
          v-model.number="local_priority"
          :min="1"
          :max="5"
          :size="200"
          :stroke-width="5"
          :value-display-function="priorityWordMap"
          primary-color="#70CAD1"
        />
        <div class="button-group">
          <button
            class="button"
            @click="changePriority(-1)"
          >
            Decrease
          </button>
          <button
            class="button"
            @click="changePriority(1)"
          >
            Increase
          </button>
        </div>
      </div>
      <div class="time-est column">
        <label>Time Estimate</label>
        <KnobControl
          v-model.number="local_timeEstimate"
          :min="0.5"
          :max="20"
          :step-size="0.5"
          :size="200"
          :stroke-width="5"
          :value-display-function="formatHours"
          primary-color="#70CAD1"
        />
        <div class="button-group">
          <button
            class="button"
            @click="changeTimeEstimate(-0.5)"
          >
            -30 min
          </button>
          <button
            class="button"
            @click="changeTimeEstimate(0.5)"
          >
            +30 min
          </button>
        </div>
      </div>
    </div>
    <div class="bottom-section">
      <label>Time Due</label>
      <div class="columns">
        <div class="right-column column">
          <!-- disabled -->
          <button
            class="button"
            :disabled="!hasClassTimes"
            @click="setTimeStart"
          >
            Start of class
          </button>
        </div>
        <div class="column">
          <div class="time">
            <div class="field">
              <input
                id="hours"
                v-model.number="local_timeHour"
                type="text"
                class="input"
                maxlength="2"
                :placeholder="11"
                required
              >
            </div>
            <div class="time-colon">
              <div class="colon">
                :
              </div>
            </div>
            <div class="field">
              <!-- v-model="" -->
              <input
                id="minutes"
                v-model.number="local_timeMinute"
                type="text"
                class="input"
                maxlength="2"
                :placeholder="59"
                required
              >
            </div>
            <div class="am-pm">
              <button
                v-if="local_timeisAm"
                class="button toggle-am-pm"
                @click="toggleAmPm(false)"
              >
                AM
              </button>
              <button
                v-else
                class="button toggle-am-pm"
                @click="toggleAmPm(true)"
              >
                PM
              </button>
            </div>
          </div>
          <small>Default Time: 11:59 pm</small>
        </div>
        <div class="left-column column">
          <button
            class="button"
            :disabled="!hasClassTimes"
            @click="setTimeEnd"
          >
            End of class
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import KnobControl from 'vue-knob-control';
import '../../assets/component-override.scss';

import moment from 'moment';

export default {
  name: 'ModalPriorityAndTimeEstimate',
  components: {
    KnobControl
  },
  props: ['activeCRN', 'dueTime', 'priority', 'timeEstimate'],
  data () {
    return {
      local_timeHour: 11,
      local_timeMinute: 59,
      local_timeisAm: false,
      local_priority: 3,
      local_timeEstimate: 1
    };
  },
  computed: {
    formattedTime () {
      return `${(this.local_timeisAm
        ? this.local_timeHour
        : this.local_timeHour + 12
      )
        .toString()
        .padStart(2, '0')}:${this.local_timeMinute
        .toString()
        .padStart(2, '0')}`;
    },
    hasClassTimes: function () {
      if (this.activeCRN === undefined) {
        return false;
      }
      let courseSchedule = this.$store.getters.getCourseScheduleAsEvents.filter(
        ev => ev.course.crn === this.activeCRN
      );

      if (courseSchedule.length === 0) {
        return false;
      }
      return true;
    }
  },
  watch: {
    dueTime (newDueTime) {
      this.setTime(newDueTime);
    },
    local_timeHour: function (val, old) {
      this.$emit('update-due-time', this.formattedTime);
    },
    local_timeMinute: function (val, old) {
      this.$emit('update-due-time', this.formattedTime);
    },
    local_priority: function (val) {
      this.$emit('update-priority', val);
    },
    local_timeEstimate: function (val) {
      this.$emit('update-time-estimate', val);
    },
    local_timeisAm: function (val) {
      this.$emit('update-time-is-am', val);
    }
  },
  created () {
    this.setTime(this.dueTime);
  },
  methods: {
    setTime: function (timeStr) {
      // HH:mm
      const time = moment(timeStr, 'HH:mm', true);

      this.local_timeMinute = time.minutes();
      this.local_timeHour = time.hours();
      if (time.hours() > 12) {
        this.local_timeHour -= 12;
        this.local_timeisAm = false;
      }
    },
    setTimeStart: function () {
      let courseSchedule = this.$store.getters.getCourseScheduleAsEvents;
      courseSchedule = courseSchedule.filter(
        ev => ev.course.crn === this.activeCRN
      );
      this.setTime(courseSchedule[0].start); // Hmm
    },
    setTimeEnd: function () {
      let courseSchedule = this.$store.getters.getCourseScheduleAsEvents;
      courseSchedule = courseSchedule.filter(
        ev => ev.course.crn === this.activeCRN
      );
      this.setTime(courseSchedule[0].end); // Hmm
    },
    toggleAmPm: function (val) {
      this.local_timeisAm = !this.local_timeisAm;
    },
    formatHours: function (val) {
      if (val > 1) {
        return val + ' hours';
      } else {
        return val + ' hour';
      }
    },
    priorityWordMap: function (val) {
      const wordMap = {
        1: 'Optional',
        2: 'Low',
        3: 'Medium',
        4: 'High',
        5: '𝙊𝙃 𝙂𝙊𝘿'
      };
      return wordMap[val];
    },
    changeTimeEstimate: function (val) {
      if (
        this.local_timeEstimate + val < 0.5 ||
        this.local_timeEstimate + val > 20
      ) {
        return;
      }
      this.local_timeEstimate += val;
    },
    changePriority: function (val) {
      if (this.local_priority + val < 1 || this.local_priority + val > 5) {
        return;
      }
      this.local_priority += val;
    }
  }
};
</script>

<style lang="scss" scoped>
.toggle-am-pm {
  height: 49px;
  margin-top: 0px !important;
}

label {
  font-size: 18px;
  padding-bottom: 5px;
  border-bottom: 1px #dbdbdb solid;
}

.right-column,
.left-column {
  flex-grow: 0 !important;
}

.right-column > button,
.left-column > button {
  margin-top: 20px !important;
  height: 49px;
}

.bottom-section {
  text-align: center;
}

.am-pm {
  display: inline-block;
  padding-left: 10px;
}

#am-pm {
  margin-top: 0px;
  height: 49px;
}

.field {
  display: inline-block;
  margin-bottom: 0px !important;
}

.time-colon {
  display: inline-block;
  font-size: 25px;
  margin-bottom: -20px;
}

.colon {
  display: table;
  padding-left: 12px;
  padding-right: 12px;
}

input {
  font-size: 22px;
  width: 55px;
}

.time {
  padding-top: 20px;
  text-align: center;
  margin: 0 auto;
  width: 100%;
}

.priority {
  border-right: 1px solid #dbdbdb;
}

.column {
  text-align: center;
}

.button {
  font-size: 20px;
  margin: 5px;
}
</style>
