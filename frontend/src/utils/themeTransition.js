export const TRANSITION_CONFIG = {
  variant: "circle-blur", // "circle" | "circle-blur" | "polygon"
  start: "top-right", // "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"
};

// Easing curves — silky smooth expansion
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

// Single source of truth for the corner-mask reveal duration.
// Tuned to 2.1s for a luxurious, smooth, visible circle-blur reveal
const MASK_DURATION = "2.1s";

const getPositionCoords = (position) => {
  switch (position) {
    case "top-left":
      return { cx: "0", cy: "0" };
    case "top-right":
      return { cx: "40", cy: "0" };
    case "bottom-left":
      return { cx: "0", cy: "40" };
    case "bottom-right":
      return { cx: "40", cy: "40" };
    default:
      return { cx: "40", cy: "0" };
  }
};

const generateSVG = (variant, start) => {
  if (start === "center") return "";
  const coords = getPositionCoords(start);
  const { cx, cy } = coords;

  let markup = "";
  if (variant === "circle") {
    markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="${cx}" cy="${cy}" r="20" fill="white"/></svg>`;
  } else if (variant === "circle-blur") {
    markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs><circle cx="${cx}" cy="${cy}" r="18" fill="white" filter="url(#blur)"/></svg>`;
  } else {
    return "";
  }

  const encoded = encodeURIComponent(markup)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  return `data:image/svg+xml,${encoded}`;
};

const getTransformOrigin = (start) => {
  switch (start) {
    case "top-left":
      return "top left";
    case "top-right":
      return "top right";
    case "bottom-left":
      return "bottom left";
    case "bottom-right":
      return "bottom right";
    default:
      return "top right";
  }
};

export const createAnimation = (variant = "circle-blur", start = "top-right") => {
  const svg = generateSVG(variant, start);
  const transformOrigin = getTransformOrigin(start);
  const name = `${variant}-${start}`;

  if (variant === "polygon") {
    return {
      name,
      css: `
        ::view-transition-group(root) {
          animation-duration: 0.7s;
          animation-timing-function: ${EASE_OUT};
        }
        ::view-transition-new(root) { animation-name: reveal-light; }
        ::view-transition-old(root),
        .dark::view-transition-old(root) { animation: none; z-index: -1; }
        .dark::view-transition-new(root) { animation-name: reveal-dark; }

        @keyframes reveal-dark {
          from { clip-path: polygon(50% -71%, -50% 71%, -50% 71%, 50% -71%); }
          to { clip-path: polygon(50% -71%, -50% 71%, 50% 171%, 171% 50%); }
        }
        @keyframes reveal-light {
          from { clip-path: polygon(171% 50%, 50% 171%, 50% 171%, 171% 50%); }
          to { clip-path: polygon(171% 50%, 50% 171%, -50% 71%, 50% -71%); }
        }
      `,
    };
  }

  // circle / circle-blur with a corner start
  return {
    name,
    css: `
      ::view-transition-group(root) {
        animation-duration: ${MASK_DURATION};
        animation-timing-function: ${EASE_OUT};
      }
      ::view-transition-new(root) {
        mask: url('${svg}') ${start.replace("-", " ")} / 0 no-repeat;
        mask-origin: content-box;
        animation: scale-${name} ${MASK_DURATION} ${EASE_OUT} both;
        transform-origin: ${transformOrigin};
      }
      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: scale-${name} ${MASK_DURATION} ${EASE_OUT} both;
        transform-origin: ${transformOrigin};
        z-index: -1;
      }
      @keyframes scale-${name} {
        to { mask-size: 350vmax; }
      }
    `,
  };
};
