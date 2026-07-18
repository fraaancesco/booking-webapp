import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import { BlueprintPreset } from './styles/blueprint-preset'
import './styles/blueprint.css'
import { i18n } from './i18n'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(PrimeVue, {
  theme: {
    preset: BlueprintPreset,
    options: {
      darkModeSelector: false,
    },
  },
})
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')
