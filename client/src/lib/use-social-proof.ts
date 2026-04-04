import { useMemo } from "react";

const SESSION_SALT_KEY = "ssp-social-proof-salt";

export function hashText(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Session-stable salt + 20-minute bucket so counts drift slowly and repeat visits look natural. */
export function useSocialProofSession() {
  return useMemo(() => {
    const timeBucket = Math.floor(Date.now() / (1000 * 60 * 20));
    let sessionSalt = 71;
    if (typeof window !== "undefined") {
      const raw = window.sessionStorage.getItem(SESSION_SALT_KEY);
      if (raw) {
        sessionSalt = Number(raw) || sessionSalt;
      } else {
        sessionSalt = 100 + Math.floor(Math.random() * 900);
        window.sessionStorage.setItem(SESSION_SALT_KEY, String(sessionSalt));
      }
    }
    const seed = timeBucket + sessionSalt;

    const countForKey = (key: string, base: number, spread: number) =>
      base + (hashText(`${key}-${seed}`) % spread);

    const planMessage = (key: string, count: number) => {
      const options = [
        `${count} people are checking this plan now`,
        `${count} shoppers looked at this plan recently`,
        `${count} people viewed this plan in the last hour`,
      ];
      return options[hashText(`plan-msg-${key}-${seed}`) % options.length];
    };

    const deviceMessage = (key: string, count: number) => {
      const options = [
        `${count} people are viewing this right now`,
        `${count} shoppers viewed this device recently`,
        `${count} people checked this device in the last hour`,
      ];
      return options[hashText(`device-msg-${key}-${seed}`) % options.length];
    };

    return { seed, countForKey, planMessage, deviceMessage };
  }, []);
}
