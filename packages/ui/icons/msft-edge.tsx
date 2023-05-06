import { type Ref, type SVGProps, forwardRef } from "react"

const MsftEdgeSvg = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>
) => (
  <svg viewBox="0 0 256 256" ref={ref} {...props}>
    <defs>
      <radialGradient
        id="edge-b"
        cx={161.83}
        cy={788.401}
        r={95.38}
        gradientTransform="matrix(.9999 0 0 .9498 -4.622 -570.387)"
        gradientUnits="userSpaceOnUse">
        <stop
          offset={0.72}
          style={{
            stopColor: "#000",
            stopOpacity: 0
          }}
        />
        <stop
          offset={0.95}
          style={{
            stopColor: "#000",
            stopOpacity: 0.53
          }}
        />
        <stop
          offset={1}
          style={{
            stopColor: "#000"
          }}
        />
      </radialGradient>
      <radialGradient
        id="edge-d"
        cx={-773.636}
        cy={746.715}
        r={143.24}
        gradientTransform="matrix(.15 -.9898 .8 .12 -410.718 -656.341)"
        gradientUnits="userSpaceOnUse">
        <stop
          offset={0.76}
          style={{
            stopColor: "#000",
            stopOpacity: 0
          }}
        />
        <stop
          offset={0.95}
          style={{
            stopColor: "#000",
            stopOpacity: 0.5
          }}
        />
        <stop
          offset={1}
          style={{
            stopColor: "#000"
          }}
        />
      </radialGradient>
      <radialGradient
        id="edge-e"
        cx={230.593}
        cy={-106.038}
        r={202.43}
        gradientTransform="matrix(-.04 .9998 -2.1299 -.07998 -190.775 -191.635)"
        gradientUnits="userSpaceOnUse">
        <stop
          offset={0}
          style={{
            stopColor: "#35c1f1"
          }}
        />
        <stop
          offset={0.11}
          style={{
            stopColor: "#34c1ed"
          }}
        />
        <stop
          offset={0.23}
          style={{
            stopColor: "#2fc2df"
          }}
        />
        <stop
          offset={0.31}
          style={{
            stopColor: "#2bc3d2"
          }}
        />
        <stop
          offset={0.67}
          style={{
            stopColor: "#36c752"
          }}
        />
      </radialGradient>
      <radialGradient
        id="edge-f"
        cx={536.357}
        cy={-117.703}
        r={97.34}
        gradientTransform="matrix(.28 .9598 -.78 .23 -1.928 -410.318)"
        gradientUnits="userSpaceOnUse">
        <stop
          offset={0}
          style={{
            stopColor: "#66eb6e"
          }}
        />
        <stop
          offset={1}
          style={{
            stopColor: "#66eb6e",
            stopOpacity: 0
          }}
        />
      </radialGradient>
      <linearGradient
        id="edge-a"
        gradientUnits="userSpaceOnUse"
        x1={63.334}
        y1={757.83}
        x2={241.617}
        y2={757.83}
        gradientTransform="translate(-4.63 -580.81)">
        <stop
          offset={0}
          style={{
            stopColor: "#0c59a4"
          }}
        />
        <stop
          offset={1}
          style={{
            stopColor: "#114a8b"
          }}
        />
      </linearGradient>
      <linearGradient
        id="edge-c"
        gradientUnits="userSpaceOnUse"
        x1={157.401}
        y1={680.556}
        x2={46.028}
        y2={801.868}
        gradientTransform="translate(-4.63 -580.81)">
        <stop
          offset={0}
          style={{
            stopColor: "#1b9de2"
          }}
        />
        <stop
          offset={0.16}
          style={{
            stopColor: "#1595df"
          }}
        />
        <stop
          offset={0.67}
          style={{
            stopColor: "#0680d7"
          }}
        />
        <stop
          offset={1}
          style={{
            stopColor: "#0078d4"
          }}
        />
      </linearGradient>
    </defs>
    <path
      fill="url(#edge-a)"
      d="M231 190.5c-3.4 1.8-6.9 3.4-10.5 4.7-11.5 4.3-23.6 6.5-35.9 6.5-47.3 0-88.5-32.5-88.5-74.3.1-11.4 6.4-21.9 16.4-27.3-42.8 1.8-53.8 46.4-53.8 72.5 0 73.9 68.1 81.4 82.8 81.4 7.9 0 19.8-2.3 27-4.6l1.3-.4c27.6-9.5 51-28.1 66.6-52.8 1.2-1.9.6-4.3-1.2-5.5-1.3-.8-2.9-.9-4.2-.2z"
    />
    <path
      opacity={0.35}
      fill="url(#edge-b)"
      d="M231 190.5c-3.4 1.8-6.9 3.4-10.5 4.7-11.5 4.3-23.6 6.5-35.9 6.5-47.3 0-88.5-32.5-88.5-74.3.1-11.4 6.4-21.9 16.4-27.3-42.8 1.8-53.8 46.4-53.8 72.5 0 73.9 68.1 81.4 82.8 81.4 7.9 0 19.8-2.3 27-4.6l1.3-.4c27.6-9.5 51-28.1 66.6-52.8 1.2-1.9.6-4.3-1.2-5.5-1.3-.8-2.9-.9-4.2-.2z"
    />
    <path
      fill="url(#edge-c)"
      d="M105.7 241.4c-8.9-5.5-16.6-12.8-22.7-21.3-26.3-36-18.4-86.5 17.6-112.8 3.8-2.7 7.7-5.2 11.9-7.2 3.1-1.5 8.4-4.1 15.5-4 10.1.1 19.6 4.9 25.7 13 4 5.4 6.3 11.9 6.4 18.7 0-.2 24.5-79.6-80-79.6-43.9 0-80 41.7-80 78.2-.2 19.3 4 38.5 12.1 56 27.6 58.8 94.8 87.6 156.4 67.1-21.1 6.6-44.1 3.7-62.9-8.1z"
    />
    <path
      opacity={0.41}
      fill="url(#edge-d)"
      d="M105.7 241.4c-8.9-5.5-16.6-12.8-22.7-21.3-26.3-36-18.4-86.5 17.6-112.8 3.8-2.7 7.7-5.2 11.9-7.2 3.1-1.5 8.4-4.1 15.5-4 10.1.1 19.6 4.9 25.7 13 4 5.4 6.3 11.9 6.4 18.7 0-.2 24.5-79.6-80-79.6-43.9 0-80 41.7-80 78.2-.2 19.3 4 38.5 12.1 56 27.6 58.8 94.8 87.6 156.4 67.1-21.1 6.6-44.1 3.7-62.9-8.1z"
    />
    <path
      fill="url(#edge-e)"
      d="M152.3 148.9c-.8 1-3.3 2.5-3.3 5.7 0 2.6 1.7 5.1 4.7 7.2 14.4 10 41.5 8.7 41.6 8.7 10.7 0 21.1-2.9 30.3-8.3 18.8-11 30.4-31.1 30.4-52.9.3-22.4-8-37.3-11.3-43.9C223.5 23.9 177.7 0 128 0 58 0 1 56.2 0 126.2c.5-36.5 36.8-66 80-66 3.5 0 23.5.3 42 10.1 16.3 8.6 24.9 18.9 30.8 29.2 6.2 10.7 7.3 24.1 7.3 29.5 0 5.3-2.7 13.3-7.8 19.9z"
    />
    <path
      fill="url(#edge-f)"
      d="M152.3 148.9c-.8 1-3.3 2.5-3.3 5.7 0 2.6 1.7 5.1 4.7 7.2 14.4 10 41.5 8.7 41.6 8.7 10.7 0 21.1-2.9 30.3-8.3 18.8-11 30.4-31.1 30.4-52.9.3-22.4-8-37.3-11.3-43.9C223.5 23.9 177.7 0 128 0 58 0 1 56.2 0 126.2c.5-36.5 36.8-66 80-66 3.5 0 23.5.3 42 10.1 16.3 8.6 24.9 18.9 30.8 29.2 6.2 10.7 7.3 24.1 7.3 29.5 0 5.3-2.7 13.3-7.8 19.9z"
    />
  </svg>
)

export const MsftEdge = forwardRef(MsftEdgeSvg)
