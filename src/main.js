import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Api from './api';

import FullCalendar from 'vue-full-calendar';
import KnobControl from 'vue-knob-control';
import Toasted from 'vue-toasted';

import 'bulma-tooltip';

import VueProgressBar from 'vue-progressbar';
import VueTour from 'vue-tour';

Vue.use(VueTour);

const options = {
  color: '#70cad1',
  failedColor: '#874b4b',
  thickness: '5px',
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
Vue.use(KnobControl);
Vue.use(Toasted, {
  router,
  fullWidth: true,
  iconPack: 'fontawesome',
  fitToScreen: true,
  duration: 5000,
  position: 'bottom-center'
});
Vue.config.productionTip = false;

Vue.prototype.$http = Api;

const app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

export default app;
