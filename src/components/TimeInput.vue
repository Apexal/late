<template>
  <div class="time-input">
    <select
      :value="localHours"
      @input="setHours($event.target.value)"
    >
      <option
        v-for="h in 12"
        :key="h"
      >
        {{ h }}
      </option>
    </select>
    <select
      :value="localMinutes"
      @input="setMinutes($event.target.value)"
    >
      <option
        v-for="m in minutesList"
        :key="m"
      >
        {{ m }}
      </option>
    </select>
    <button
      type="button"
      class="button"
      @click="toggleIsAM"
    >
      {{ localIsAM ? 'AM' : 'PM' }}
    </button>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'TimeInput',
  props: ['value'],
  data () {
    return {
      localHours: 1,
      localMinutes: 0,
      localIsAM: true
    };
  },
  computed: {
    properHours () {
      return this.localIsAM ? parseInt(this.localHours) + 12 : this.localHours;
    },
    formatted () {
      // HH:mm
      return `${this.properHours
        .toString()
        .padStart(2, '0')}:${this.localMinutes.toString().padStart(2, '0')}`;
    },
    minutesList () {
      const minutes = [];
      for (let m = 0; m < 60; m += 15) {
        minutes.push(m);
      }
      return minutes;
    }
  },
  watch: {
    value (newValue) {
      const time = moment(newValue, 'HH:mm', true);
      this.localIsAM = time.hours() < 12;
      this.localHours = time.hours() - (this.localIsAM ? 0 : 12);
      this.localMinutes = time.minutes();
    }
  },
  methods: {
    setHours (hours) {
      this.localHours = hours;
      this.$emit('input', this.formatted);
    },
    setMinutes (minutes) {
      this.localMinutes = minutes;
      this.$emit('input', this.formatted);
    },
    setIsAM (isAM) {
      this.localIsAM = isAM;
      this.$emit('input', this.formatted);
    },
    toggleIsAM () {
      this.localIsAM = !this.localIsAM;
      this.$emit('input', this.formatted);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
