<template>
  <GmapMap
    :center="commons"
    :zoom="18"
    map-type-id="hybrid"
    style="width: 100%;height: 400px;"
  >
    <gmap-info-window
      :options="infoOptions"
      :position="infoWindowPos"
      :opened="infoWinOpen"
      @closeclick="infoWinOpen=false"
    >
      {{ infoContent }}
    </gmap-info-window>
    <GmapMarker
      v-for="(m, index) in markers"
      :key="index"
      :position="m.position"
      :clickable="true"
      :draggable="false"
      @click="toggleInfoWindow(m,i)"
    />
  </GmapMap>
</template>

<script>
export default {
  name: 'GoogleMap',
  data () {
    return {
      infoContent: '',
      infoWindowPos: null,
      infoWinOpen: false,
      currentMidx: null,
      infoOptions: {
        pixelOffset: {
          width: 0,
          height: -35
        }
      }
    };
  },
  computed: {
    commons () {
      return { lat: 42.728342, lng: -73.674254 };
    },
    markers () {
      return [{
        position: { lat: 42.729551, lng: -73.679074 },
        infoText: 'Lecture in DCC 208 at 3pm'
      }];
    }
  },
  methods: {
    toggleInfoWindow (marker, idx) {
      this.infoWindowPos = marker.position;
      this.infoContent = marker.infoText;
      // check if its the same marker that was selected if yes toggle
      if (this.currentMidx === idx) {
        this.infoWinOpen = !this.infoWinOpen;
      } else { // if different marker set infowindow to open and reset current marker index
        this.infoWinOpen = true;
        this.currentMidx = idx;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
#map {
  height: 100%;
}
</style>
