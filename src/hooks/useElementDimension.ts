import { useState, useEffect, RefObject } from 'react';

export function useElementDimension<T extends HTMLElement>(elementRef: RefObject<T>) {
  const [dimensions, setDimensions] = useState<{ width: number | null; height: number | null }>({
    width: null,
    height: null
  });

  useEffect(() => {
    if (elementRef.current) {
      setDimensions({
        width: elementRef.current.offsetWidth,
        height: elementRef.current.offsetHeight
      });
    }
  }, [elementRef]);

  return dimensions;
}
