import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Api from './api';

import FullCalendar from 'vue-full-calendar';

Vue.use(FullCalendar);
// Vue.use(VueMarkdown);

Vue.config.productionTip = false;

Vue.prototype.$http = Api;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
