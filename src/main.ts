import { createApp } from "vue";
import PrimeVue from "primevue/config";
import "primevue/resources/themes/saga-blue/theme.css"; // Import the theme
import "primevue/resources/primevue.min.css"; // Core CSS
import "primeicons/primeicons.css"; // Icons

// Import and register PrimeVue components if necessary
import Button from "primevue/button";

export function initializePrimeVue(app: any) {
  app.use(PrimeVue);
  app.component("Button", Button);
}
