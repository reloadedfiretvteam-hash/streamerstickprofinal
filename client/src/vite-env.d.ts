/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SURFSHARK_AFFILIATE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.mp4" {
  const src: string;
  export default src;
}

declare module "*.webm" {
  const src: string;
  export default src;
}

declare module "*.ogg" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}
