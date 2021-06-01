import Vue from 'vue'
import App from './App'
// import axios from '@/utils/request.js'
import {myRequest} from '@/utils/myRequest.js'

Vue.config.productionTip = false;
// Vue.prototype.$axios = axios
Vue.prototype.$myRequest = myRequest;

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
