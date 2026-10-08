import {
  SURFSHARK_ADBLOCK_URL,
  SURFSHARK_AFFILIATE_URL,
  SURFSHARK_ANTIVIRUS_URL,
} from "@shared/surfshark-affiliate";

export { SURFSHARK_ADBLOCK_URL, SURFSHARK_AFFILIATE_URL, SURFSHARK_ANTIVIRUS_URL };

export function getSurfsharkAffiliateUrl(): string {
  return SURFSHARK_AFFILIATE_URL;
}
