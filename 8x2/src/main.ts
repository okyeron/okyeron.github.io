import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { useClickBurst } from '@/utils/clickBurst';

const app = createApp(App);

app.directive('click-burst', useClickBurst());

app.mount('#app');
