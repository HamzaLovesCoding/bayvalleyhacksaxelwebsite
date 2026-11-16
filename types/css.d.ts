import "react";

// Lets components pass CSS custom properties (style={{ "--p": 0.5 }}) without casts.
declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
