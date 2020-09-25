import { useEffect, useState } from "react";

export const useRefDimensions = (elementRef) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = elementRef.current;
    //console.log("panHooks dimensions", el);
    setDimensions({ width: el.clientWidth, height: el.clientHeight });
  }, [elementRef]);
  return [dimensions];
};
