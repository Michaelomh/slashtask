'use client';

import { RefObject, useEffect, useState } from 'react';

/**
 * Returns true if the referenced element's content is wider than its visible area.
 * Re-evaluates on every size change via ResizeObserver.
 *
 * Useful for conditionally showing a tooltip when text is truncated.
 *
 * @example
 * const ref = useRef<HTMLSpanElement>(null);
 * const isOverflow = useIsOverflow(ref);
 *
 * return (
 *   <Tooltip content={label} disabled={!isOverflow}>
 *     <span ref={ref} className="truncate">{label}</span>
 *   </Tooltip>
 * );
 */
export function useIsOverflow(ref: RefObject<HTMLElement | null>): boolean {
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function check() {
      setIsOverflow(el!.scrollWidth > el!.offsetWidth);
    }

    check();

    const observer = new ResizeObserver(check);
    observer.observe(el);

    return () => observer.disconnect();
  }, [ref]);

  return isOverflow;
}
