import Vue from 'vue'
import App from './src/App.vue'

const app = new Vue({
  render: h => h(App)
}).$mount('#app')
