import { type Ref, type SVGProps, forwardRef } from "react"

const LocalAISvg = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={824}
    height={824}
    fill="none"
    viewBox="0 0 824 824"
    {...props}>
    <rect width={824} height={824} fill="url(#a)" rx={180} />
    <g filter="url(#b)">
      <path
        fill="#F3F3F3"
        d="M230.621 210v441h-83.16V210h83.16Zm244.927 441-13.23-69.93h-99.54L349.548 651h-85.68l85.05-441h130.41l80.64 441h-84.42Zm-64.26-359.1-24.57 146.79-13.86 74.97h78.75l-14.49-74.97-24.57-146.79h-1.26ZM593.506 651V329.07h83.16V651h-83.16Zm0-441h83.16v85.05h-83.16V210Z"
      />
    </g>
    <rect width={824} height={824} fill="url(#c)" fillOpacity={0.54} rx={180} />
    <defs>
      <radialGradient
        id="c"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="rotate(90 0 412) scale(576.5)"
        gradientUnits="userSpaceOnUse">
        <stop offset={0.046} stopOpacity={0.51} />
        <stop offset={0.39} stopColor="#E0E0E0" stopOpacity={0.29} />
        <stop offset={0.657} stopColor="#040404" stopOpacity={0.19} />
        <stop offset={0.807} stopOpacity={0.066} />
      </radialGradient>
      <linearGradient
        id="a"
        x1={412}
        x2={412}
        y1={0}
        y2={824}
        gradientUnits="userSpaceOnUse">
        <stop offset={0.003} stopColor="#8C8C8C" />
        <stop offset={0.996} stopColor="#1D1D1D" />
      </linearGradient>
      <filter
        id="b"
        width={561.205}
        height={473}
        x={131.461}
        y={198.7}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy={4.7} />
        <feGaussianBlur stdDeviation={8} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0.2 0 0 0 0 0.2 0 0 0 0 0.2 0 0 0 1 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_382_2" />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_382_2"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)

export const LocalAI = forwardRef(LocalAISvg)
