export const env = {
  firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  firebaseAuthDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  firebaseStorageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  firebaseMessagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  firebaseAppId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  firebaseMeasurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",

  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabaseAnonKey:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_KEY ||
    "",

  emailJsService: import.meta.env.VITE_EMAILJS_SERVICE || "",
  emailJsTemplate: import.meta.env.VITE_EMAILJS_TEMPLATE || "",
  emailJsPublic: import.meta.env.VITE_EMAILJS_PUBLIC || "",

  coreFeePercent: import.meta.env.VITE_CORE_FEE_PERCENT || "",
  gatewayFeePercent: import.meta.env.VITE_GATEWAY_FEE_PERCENT || "",
  gatewayThreshold: import.meta.env.VITE_GATEWAY_THRESHOLD || "",

  partnerApiUrl: import.meta.env.VITE_PARTNER_API_URL || "",
  customerApiUrl: import.meta.env.VITE_CUSTOMER_API_URL || "",

  serviceApiKey:
    import.meta.env.VITE_SERVICE_API_KEY ||
    import.meta.env.VITE_FLIP_SECRET ||
    "",
  flipSecret: import.meta.env.VITE_FLIP_SECRET || "",
};
