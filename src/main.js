import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Api from './api';

import FullCalendar from 'vue-full-calendar';
import Toasted from 'vue-toasted';

import 'bulma-tooltip';

Vue.use(FullCalendar);

Vue.use(Toasted, {
  router,
  fullWidth: true,
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
