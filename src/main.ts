import { createApp } from "vue";
import PrimeVue from "primevue/config";

const app = createApp({});

app.use(PrimeVue);

import { createPinia } from "pinia";
const pinia = createPinia();

app.use(pinia);

export default app;
