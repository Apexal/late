import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Api from './api';

import FullCalendar from 'vue-full-calendar';

import Buefy from 'buefy';

import 'bulma-tooltip';

import VueProgressBar from 'vue-progressbar';

import CourseAssessmentDot from '@/views/components/CourseAssessmentDot';

import wysiwyg from 'vue-wysiwyg';

import datemethods from './mixins/datemethods';
import sharedproperties from './mixins/sharedproperties';

import * as VueGoogleMaps from 'vue2-google-maps';
import VueSocketIO from 'vue-socket.io';

Vue.use(
  new VueSocketIO({
    debug: true,
    connection: process.env.BASE_URL,
    vuex: {
      store,
      actionPrefix: 'SOCKET_',
      mutationPrefix: 'SOCKET_'
    },
    timeout: 10000
  })
);

Vue.component('CourseAssessmentDot', CourseAssessmentDot);
Vue.use(wysiwyg, { hideModules: { image: true } });
Vue.use(Buefy, {
  defaultIconPack: 'fas'
});

const options = {
  color: '#70cad1',
  failedColor: '#874b4b',
  thickness: '2px',
  transition: {
    speed: '0.2s',
    opacity: '0.6s',
    termination: 300
  },
  autoRevert: true,
  location: 'top',
  inverse: false
};
Vue.use(VueProgressBar, options);

Vue.use(FullCalendar);
Vue.config.productionTip = false;

Vue.prototype.$http = Api;

Vue.use(VueGoogleMaps, {
  load: {
    key: process.env.VUE_APP_GOOGLE_API_KEY
  }

  /// / If you intend to programmatically custom event listener code
  /// / (e.g. `this.$refs.gmap.$on('zoom_changed', someFunc)`)
  /// / instead of going through Vue templates (e.g. `<GmapMap @zoom_changed="someFunc">`)
  /// / you might need to turn this on.
  // autobindAllEvents: false,

  /// / If you want to manually install components, e.g.
  /// / import {GmapMarker} from 'vue2-google-maps/src/components/marker'
  /// / Vue.component('GmapMarker', GmapMarker)
  /// / then disable the following:
  // installComponents: true,
});

Vue.mixin(datemethods);
Vue.mixin(sharedproperties);

const app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

export default app;
