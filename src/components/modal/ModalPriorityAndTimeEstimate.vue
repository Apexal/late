<template>
  <div>
    <div class="columns">
      <div class="priority column">
        <label>
          Priority
        </label>
        <KnobControl
          v-model="local_priority"
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
        <label>
          Time Estimate
        </label>
        <KnobControl
          v-model="local_timeEstimate"
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
      <label>
        Time Due
      </label>
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
                v-model="local_timeHour"
                type="text"
                class="input"
                maxlength="2"
                :placeholder="11"
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
                v-model="local_timeMinute"
                type="text"
                class="input"
                maxlength="2"
                :placeholder="59"
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
          <small>
            Default Time: 11:59 pm
          </small>
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

export default {
  name: 'ModalPriorityAndTimeEstimate',
  components: {
    KnobControl
  },
  props: ['activeCRN', 'timeHour', 'timeMinute', 'timeisAm', 'priority', 'timeEstimate'],
  data () {
    return {
      local_timeHour: this.timeHour,
      local_timeMinute: this.timeMinute,
      local_timeisAm: this.timeisAm,
      local_priority: this.priority,
      local_timeEstimate: this.timeEstimate,
      hasClass: this.hasClassTimes
    };
  },
  computed: {
    hasClassTimes: function () {
      if (this.activeCRN === undefined) {
        return false;
      }
      let courseSchedule = this.$store.getters.getCourseScheduleAsEvents;
      courseSchedule = courseSchedule.filter(ev => ev.course.crn === this.activeCRN);

      if (courseSchedule.length === 0) {
        return false;
      }
      return true;
    }
  },
  watch: {
    local_timeHour: function (val, old) {
      this.checkTime();
      if (isNaN(val) || val === '0') {
        this.local_timeHour = old;
      }
      if (val > 12) {
        this.local_timeHour = old;
      } else {
        this.$emit('update-timeHour', val);
      }
    },
    local_timeMinute: function (val, old) {
      this.checkTime();
      if (isNaN(val)) {
        this.local_timeMinute = old;
      }
      if (old === '' && val > 5) {
        this.local_timeMinute = old;
      } else {
        this.$emit('update-timeMinute', val);
      }
    },
    local_priority: function (val) {
      this.$emit('update-priority', val);
    },
    local_timeEstimate: function (val) {
      this.$emit('update-timeEstimate', val);
    },
    local_timeisAm: function (val) {
      this.$emit('update-time-is-am', val);
    }
  },
  methods: {
    setTime: function (timeStr) {
      let time, hour, minute, isAm;

      time = timeStr.split(':');
      hour = time[0];
      minute = time[1];
      isAm = true;

      if (parseInt(hour) >= 12) {
        if (parseInt(hour) >= 13) {
          hour = parseInt(hour) - 12;
        }
        isAm = false;
      }
      this.local_timeisAm = isAm;

      this.local_timeHour = hour;
      this.local_timeMinute = minute;
    },
    setTimeStart: function () {
      let courseSchedule = this.$store.getters.getCourseScheduleAsEvents;
      courseSchedule = courseSchedule.filter(ev => ev.course.crn === this.activeCRN);
      this.setTime(courseSchedule[0].start);
    },
    setTimeEnd: function () {
      let courseSchedule = this.$store.getters.getCourseScheduleAsEvents;
      courseSchedule = courseSchedule.filter(ev => ev.course.crn === this.activeCRN);
      this.setTime(courseSchedule[0].end);
    },
    toggleAmPm: function (val) {
      if (val && this.local_timeHour === '12') {
        this.local_timeHour = '11';
      }
      this.local_timeisAm = val;
    },
    checkTime: function () {
      if (this.local_timeisAm && this.local_timeHour === '12') {
        this.toggleAmPm(true);
      }
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
        1: 'Very Low',
        2: 'Low',
        3: 'Medium',
        4: 'High',
        5: '𝙊𝙃 𝙂𝙊𝘿'
      };
      return wordMap[val];
    },
    changeTimeEstimate: function (val) {
      if (this.local_timeEstimate + val < 0.5 ||
        this.local_timeEstimate + val > 20) return;
      this.local_timeEstimate += val;
    },
    changePriority: function (val) {
      if (this.local_priority + val < 1 ||
        this.local_priority + val > 5) return;
      this.local_priority += val;
    }
  }
};
</script>

<style lang="scss" scoped>


.toggle-am-pm {
  height: 49px;
  margin-top:0px!important;
}

label {
  font-size: 18px;
  padding-bottom: 5px;
  border-bottom: 1px #dbdbdb solid;
}

.right-column,
.left-column{
  flex-grow: 0!important;
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
  margin-bottom: 0px!important;
}

.time-colon{
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
