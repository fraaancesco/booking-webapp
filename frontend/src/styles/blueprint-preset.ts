import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'

const steelblue = {
  50: '#eaf3fc',
  100: '#d2e4f5',
  200: '#b4cee7',
  300: '#94b5d6',
  400: '#769cc2',
  500: '#5980a6',
  600: '#45698c',
  700: '#335371',
  800: '#243d54',
  900: '#162839',
  950: '#091520',
}

const ink = {
  0: '#ffffff',
  50: '#f2f2f3',
  100: '#e4e4e6',
  200: '#c9c9cc',
  300: '#adadb2',
  400: '#8f8f95',
  500: '#6f6f75',
  600: '#55555a',
  700: '#3d3d40',
  800: '#28282a',
  900: '#1d1f20',
  950: '#121213',
}

export const BlueprintPreset = definePreset(Aura, {
  primitive: {
    steelblue,
    ink,
    borderRadius: {
      none: '0',
      xs: '0',
      sm: '0',
      md: '0',
      lg: '0',
      xl: '0',
    },
  },
  semantic: {
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{steelblue.500}',
      offset: '2px',
    },
    formField: {
      focusRing: {
        width: '2px',
        style: 'solid',
        color: '{steelblue.500}',
        offset: '2px',
      },
    },
    primary: {
      50: '{steelblue.50}',
      100: '{steelblue.100}',
      200: '{steelblue.200}',
      300: '{steelblue.300}',
      400: '{steelblue.400}',
      500: '{steelblue.500}',
      600: '{steelblue.600}',
      700: '{steelblue.700}',
      800: '{steelblue.800}',
      900: '{steelblue.900}',
      950: '{steelblue.950}',
    },
    colorScheme: {
      light: {
        surface: ink,
        primary: {
          color: '{steelblue.500}',
          contrastColor: '{ink.0}',
          hoverColor: '{steelblue.600}',
          activeColor: '{steelblue.700}',
        },
        text: {
          color: '{ink.900}',
          hoverColor: '{ink.900}',
          mutedColor: '{ink.600}',
        },
        highlight: {
          background: '{steelblue.500}',
          color: '{ink.0}',
        },
        content: {
          background: 'transparent',
          borderColor: '{steelblue.300}',
        },
        formField: {
          background: 'transparent',
          borderColor: '{steelblue.300}',
          hoverBorderColor: '{steelblue.400}',
          focusBorderColor: '{steelblue.500}',
          color: '{ink.900}',
          placeholderColor: '{ink.500}',
        },
      },
    },
  },
  components: {
    card: {
      colorScheme: {
        light: {
          background: 'transparent',
          color: '{ink.900}',
        },
      },
      shadow: 'none',
    },
    button: {
      colorScheme: {
        light: {
          outlinedPrimaryBorderColor: '{steelblue.500}',
          textPrimaryColor: '{steelblue.600}',
        },
      },
    },
    menubar: {
      colorScheme: {
        light: {
          background: 'transparent',
        },
      },
      submenu: {
        background: '{ink.0}',
        color: '{ink.900}',
      },
    },
    dialog: {
      colorScheme: {
        light: {
          background: '{ink.0}',
          color: '{ink.900}',
        },
      },
    },
    datepicker: {
      panel: {
        background: '{ink.0}',
        color: '{ink.900}',
      },
      header: {
        background: '{ink.0}',
      },
    },
  },
})
