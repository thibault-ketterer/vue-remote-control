import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueYoutube from 'vue-youtube'

const app = createApp(App)

app.use(VueAxios, axios, VueYoutube);
// app.use(VueAxios, axios);

app.provide('axios', app.config.globalProperties.axios)  // provide 'axios'
app.mount('#app');

