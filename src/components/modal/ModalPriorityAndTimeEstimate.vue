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
      <div class="time">
        <div class="field">
          <input
            id="hours"
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
            type="text"
            class="input"
            maxlength="2"
            :placeholder="59"
          >
        </div>
        <div class="am-pm">
          <!-- v-model="" -->
          <button
            id="am-pm"
            class="button"
          >
            pm
          </button>
        </div>
      </div>
      <small>
        Default Time: 11:59 pm
      </small>
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
  props: ['priority', 'timeEstimate'],
  data () {
    return {
      local_priority: this.priority,
      local_timeEstimate: this.timeEstimate
    };
  },
  watch: {
    local_priority: function (val) {
      this.$emit('update-priority', val);
    },
    local_timeEstimate: function (val) {
      this.$emit('update-timeEstimate', val);
    }
  },
  methods: {
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

label {
  font-size: 18px;
  padding-bottom: 5px;
  border-bottom: 1px #dbdbdb solid;
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
