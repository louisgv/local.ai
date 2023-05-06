import { type Ref, type SVGProps, forwardRef } from "react"

const JaliasSvg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    width="512"
    height="512"
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}>
    <rect width="512" height="512" rx="64" fill="inherit" />
    <path
      d="M322.5 306.5L340 274.384L410.863 409H457.727V443H390.99L322.5 306.5Z"
      fill="currentColor"
    />
    <path
      d="M226.075 443H154.5V409H204.934L310.312 222.22L329 256L226.075 443Z"
      fill="currentColor"
    />
  </svg>
)

export const Jalias = forwardRef(JaliasSvg)
