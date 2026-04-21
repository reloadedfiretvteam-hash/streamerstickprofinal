/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_ADS_ID?: string;
  /** Purchase conversion label from Google Ads (short token after AW-ID/) */
  readonly VITE_GOOGLE_ADS_CONVERSION_LABEL?: string;
}
