import { keyframes } from "@emotion/react"
import styled from "@emotion/styled"

const rotateKeyframes = keyframes`
  100% {
    transform: rotate(360deg);
  }
`

const SpinnerContainer = styled.svg`
  animation: ${rotateKeyframes} 2s linear infinite;
  z-index: 2;
`

const Circle = styled.circle`
  stroke: currentColor;
  stroke-linecap: round;
  stroke-dasharray: 15%;
  fill: none;
`
export const Spinner = ({ className = "" }) => (
  <SpinnerContainer className={className}>
    <Circle cx="50%" cy="50%" r="25%" strokeWidth={"10%"}></Circle>
  </SpinnerContainer>
)
