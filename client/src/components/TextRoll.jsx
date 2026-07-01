import { useState, useEffect } from "react"
import { motion } from "motion/react"

const STAGGER = 0.035

function CharSpans({ chars, center, initialY, hoverY }) {
  return chars.map((l, i) => {
    const delay = center
      ? STAGGER * Math.abs(i - (chars.length - 1) / 2)
      : STAGGER * i
    return (
      <motion.span
        variants={{ initial: { y: initialY }, hovered: { y: hoverY } }}
        transition={{ ease: "easeInOut", delay }}
        style={{ display: "inline-block" }}
        key={i}
      >
        {l}
      </motion.span>
    )
  })
}

function TextRollInner({ children, center, isAnimated, className }) {
  const chars = children.replace(/ /g, '\u00A0').split("")

  if (!isAnimated) {
    return <span className={className}>{chars.join('')}</span>
  }

  return (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        position: "relative",
        lineHeight: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      <motion.span
        initial="initial"
        whileHover="hovered"
        className={className}
        style={{ display: "block", position: "relative" }}
      >
        <div>
          <CharSpans chars={chars} center={center} initialY={0} hoverY="-120%" />
        </div>
        <div style={{ position: "absolute", inset: 0 }}>
          <CharSpans chars={chars} center={center} initialY="120%" hoverY={0} />
        </div>
      </motion.span>
    </span>
  )
}

export default function TextRoll({
  children,
  className,
  center = false,
}) {
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    setIsAnimated(window.matchMedia("(pointer: fine)").matches)
  }, [])

  return (
    <TextRollInner
      children={children}
      center={center}
      isAnimated={isAnimated}
      className={className}
    />
  )
}
