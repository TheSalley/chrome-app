import { createApp } from "vue";
import "./assets/tailwind.css";
import PrimeVue from "primevue/config";
import Aura from '@primeuix/themes/aura';
import App from "./App.vue";

const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});
app.mount("#app");
