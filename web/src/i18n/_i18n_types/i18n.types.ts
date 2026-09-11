export type SupportedLanguage = "en" | "hi" | "mr" | "ta" | "te" | "bn";

export interface I18nDictionary {
  appTitle: string;
  searchPatient: string;
  registerPatient: string;
  demographics: string;
  vitals: string;
  prescriptions: string;
  billing: string;
  invoices: string;
  dispense: string;
  labOrders: string;
  bedMatrix: string;
  auditLogs: string;
  offlineNotice: string;
  highContrast: string;
  keyboardShortcuts: string;
  signOff: string;
  confirm: string;
  cancel: string;
  save: string;
  status: string;
  action: string;
  aiDraftBadge: string;
  aadhaarMaskedLabel: string;
  signedByDoctor: string;
}

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}
