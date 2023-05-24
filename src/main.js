import { createApp, Vue} from 'vue';
import App from './App.vue';
import router from './router';
import VueRouter from 'vue-router'
import { createMetaManager, Meta } from 'vue-meta'
import './assets/styles.css';    
import './assets/index-styles.css';  

// const app = createApp(App)
//     .use(router)
//     .use(createMetaManager());

// await router.isReady()
// app.mount('#app')

const app = createApp(App)
    .use(router)
    .use(createMetaManager()) // add this line

await router.isReady()
app.mount('#app')