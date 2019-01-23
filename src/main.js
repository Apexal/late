import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Api from './api';

import FullCalendar from 'vue-full-calendar';
import KnobControl from 'vue-knob-control';
import Toasted from 'vue-toasted';

import 'bulma-tooltip';

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

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
