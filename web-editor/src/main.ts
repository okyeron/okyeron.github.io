import { createApp } from 'vue'
// import { createPinia } from 'pinia'

import { Quasar } from 'quasar'
import iconSet from 'quasar/icon-set/material-icons'
import '@quasar/extras/animate/fadeOut.css'
import '@quasar/extras/animate/rotateIn.css'
import '@quasar/extras/animate/slideInDown.css'
import '@quasar/extras/animate/slideInUp.css'
import '@quasar/extras/animate/slideOutDown.css'
import '@quasar/extras/animate/zoomOut.css'

import 'quasar/src/css/index.sass'
import 'src/css/app.scss'

import App from './App.vue'

import router from './router'

import { useClickBurst } from 'src/utils'

const app = createApp(App)

app.directive('click-burst', useClickBurst())

// app.use(createPinia())

app
  .use(Quasar, {
    iconSet,
    plugins: {}, // import Quasar plugins and add here
    config: {
      dark: true,
      // brand: {
      // primary: '#e46262',
      // ... or all other brand colors
      // },
      // notify: {...}, // default set of options for Notify Quasar plugin
      // loading: {...}, // default set of options for Loading Quasar plugin
      // loadingBar: { ... }, // settings for LoadingBar Quasar plugin
      // ..and many more (check Installation card on each Quasar component/directive/plugin)
    },
  })
  .use(router)

app.mount('#app')
