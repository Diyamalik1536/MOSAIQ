import { useScrollReveal } from "../hooks/useScrollReveal";
import "./RevealOnScroll.css";

export default function RevealOnScroll({
  as: Element = "div",
  className = "",
  style,
  children,
  ...props
}) {
  const elementRef = useScrollReveal();

  return (
    <Element
      ref={elementRef}
      className={`tf-scroll-reveal ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </Element>
  );
}
