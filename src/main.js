import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

import Shell from './components/Shell.vue';
Vue.component("Shell", Shell);

import config from '@/config'

import {Store} from 'dmfApplLib'

const store = new Store({config: config, timeout: 10000})

Vue.mixin({

    data() {
        return {
            services: config.MQservices,
            store,
            config,
        }
    },
    methods: {
        isData(val) {
            if (val !== null && typeof (val) == 'object' && (val.DMF_LOADING || val.DMF_ERROR)) return false;
            else return true;
        }
    }
})

new Vue({
    vuetify,
    render: h => h(App)
}).$mount('#app')
