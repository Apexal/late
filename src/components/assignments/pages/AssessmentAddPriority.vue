<template>
  <div class="columns">
    <!-- <h1>What day is the assignment due</h1> -->
    <div class='priority column'>
      <label>
        Priority
      </label>
      <knob-control
        :min="1"
        :max="5"
        :size="200"
        :strokeWidth="5"
        :value-display-function="priorityWordMap"
        primary-color="#70CAD1"
        v-model="local_priority"
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
    <div class='time column'>
      <label>
        Time Estimate
      </label>
      <knob-control
        :min="0.5"
        :max="20"
        :step-size="0.5"
        :size="200"
        :strokeWidth="5"
        :value-display-function="formatTime"
        primary-color="#70CAD1"
        v-model="local_timeEstimate"
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
</template>

<script>
import KnobControl from 'vue-knob-control'
import '../../../assets/component-override.scss';

export default {
  name: 'AssessmentAddPriority',
  components: {
    KnobControl
  },
  props: ['priority', 'timeEstimate'],
  data () {
    return {
      local_priority: this.priority,
      local_timeEstimate: this.timeEstimate,
    }
  },
  methods: {
    formatTime: function(val) {
      if(val > 1){
        return val + " hours";
      }else {
        return val + " hour";
      }
    },
    priorityWordMap: function(val) {
      const word_map = {
        1: 'Very Low',
        2: 'Low',
        3: 'Medium',
        4: 'High',
        5: '𝙊𝙃 𝙂𝙊𝘿',
      }
      return word_map[val];
    },
    changeTimeEstimate: function(val) {
      if(this.local_timeEstimate + val < 0.5 ||
         this.local_timeEstimate + val > 20) return;
      this.local_timeEstimate += val;
    },
    changePriority: function(val) {
      if(this.local_priority + val < 1 ||
         this.local_priority + val > 5) return;
      this.local_priority += val;
    }
  },
  watch: {
    local_priority: function(val) {
      this.$emit('update-priority', val);
    },
    local_timeEstimate: function(val) {
      this.$emit('update-timeEstimate', val);
    }
  }
};
</script>

<style lang="scss" scoped>

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
