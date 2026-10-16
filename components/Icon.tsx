import type { SVGProps } from "react";

const paths = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  cart: <><path d="M3 4h2.2l2.3 11h10.6l2-8H6.4" /><circle cx="9.5" cy="19.5" r="1.3" /><circle cx="17" cy="19.5" r="1.3" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  arrowLeft: <path d="M15 5l-7 7 7 7" />,
  arrowRight: <path d="m9 5 7 7-7 7" />,
  arrowUpRight: <path d="M7 17 17 7M9 7h8v8" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7.5V12l3 2" /></>,
  pin: <><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></>,
  phone: <path d="M6.5 4h3l1.5 4-2 1.5a10 10 0 0 0 5.5 5.5L16 13l4 1.5v3A2 2 0 0 1 18 19.5 15.5 15.5 0 0 1 4.5 6 2 2 0 0 1 6.5 4Z" />,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" /><path d="m4 6.5 8 6.5 8-6.5" /></>,
  trash: <><path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13" /><path d="M10.5 11v5.5M13.5 11v5.5" /></>,
  zoom: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5M11 8.5v5M8.5 11h5" /></>,
  store: <><path d="M4 9.5 5.5 4h13L20 9.5" /><path d="M4 9.5h16v1a2.7 2.7 0 0 1-5.3 0 2.7 2.7 0 0 1-5.4 0 2.7 2.7 0 0 1-5.3 0Z" /><path d="M5.5 13v7h13v-7M10 20v-4.5h4V20" /></>,
  truck: <><path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.7" /><circle cx="17.5" cy="17.5" r="1.7" /></>,
  file: <><path d="M6 3.5h8l4 4V20.5H6z" /><path d="M14 3.5v4h4M9 12h6M9 15.5h6" /></>,
  info: <><circle cx="12" cy="12" r="8" /><path d="M12 11v5M12 8v.01" /></>,
  register: <><circle cx="12" cy="12" r="5" /><path d="M12 2.5v19M2.5 12h19" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
  user: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c1.2-3.6 4-5.3 7.5-5.3s6.3 1.7 7.5 5.3" /></>,
  sliders: <path d="M5 7h9M18 7h1M5 17h3M12 17h7M16 4.5v5M10 14.5v5" />,
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}

export function WhatsappIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
      <path d="M12.04 2.5a9.4 9.4 0 0 0-8.08 14.2L2.6 21.5l4.93-1.3a9.4 9.4 0 1 0 4.5-17.7Zm0 17.2a7.8 7.8 0 0 1-3.97-1.09l-.28-.17-2.93.77.78-2.85-.19-.3a7.8 7.8 0 1 1 6.59 3.64Zm4.28-5.84c-.23-.12-1.38-.68-1.6-.76-.21-.08-.37-.12-.52.12-.16.23-.6.76-.74.91-.14.16-.27.18-.5.06a6.4 6.4 0 0 1-3.17-2.77c-.24-.41.24-.38.69-1.27.08-.16.04-.29-.02-.41-.06-.12-.52-1.26-.72-1.72-.19-.45-.38-.39-.52-.4h-.45a.86.86 0 0 0-.62.29 2.6 2.6 0 0 0-.81 1.94 4.5 4.5 0 0 0 .95 2.4 10.4 10.4 0 0 0 3.98 3.52c1.48.64 2.06.69 2.8.58.45-.07 1.38-.56 1.57-1.11.2-.55.2-1.02.14-1.12-.06-.1-.21-.16-.44-.27Z" />
    </svg>
  );
}
