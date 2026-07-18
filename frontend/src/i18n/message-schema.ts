export interface MessageSchema {
  app: {
    brand: string
    nav: {
      events: string
      myBookings: string
      login: string
      register: string
      logout: string
    }
  }
  events: {
    add: string
    cartTitle: string
    remove: string
    bookTickets: string
    seatsAvailable: string
    soldOut: string
    notificationConfirmed: string
    notificationSimulated: string
    bookingFailed: string
  }
  bookings: {
    title: string
    event: string
    bookedAt: string
    tickets: string
    actions: string
    empty: string
    searchPlaceholder: string
    dateRangePlaceholder: string
    remove: string
    removeConfirmTitle: string
    removeConfirmMessage: string
    removeConfirmAccept: string
    removeConfirmReject: string
    removeSuccess: string
    removeFailed: string
  }
  auth: {
    loginTitle: string
    registerTitle: string
    email: string
    password: string
    passwordHint: string
    submitLogin: string
    submitRegister: string
    haveAccount: string
    loginFailed: string
    registerFailed: string
  }
  errors: {
    VALIDATION_ERROR: string
    UNAUTHORIZED: string
    FORBIDDEN: string
    NOT_FOUND: string
    CONFLICT: string
    INTERNAL_ERROR: string
    NETWORK_ERROR: string
    AUTH_INVALID_CREDENTIALS: string
    AUTH_EMAIL_ALREADY_REGISTERED: string
    BOOKING_NOT_FOUND: string
    BOOKING_EVENT_NOT_FOUND: string
    BOOKING_INSUFFICIENT_SEATS: string
    BOOKING_DUPLICATE_EVENT: string
  }
}
