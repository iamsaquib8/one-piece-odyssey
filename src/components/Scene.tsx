import { useEffect, useRef, useState } from 'react';
import { PixelScene } from './PixelScene';

export function Scene({locationId, name, className = '', eager = false}: {locationId:string; name:string; className?:string; eager?:boolean}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible,setVisible] = useState(eager);
  useEffect(()=>{
    const element = ref.current;
    if (!element || eager) return;
    const observer = new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting){setVisible(true);observer.disconnect();}
    },{rootMargin:'600px'});
    observer.observe(element);
    return ()=>observer.disconnect();
  },[eager]);
  return <div ref={ref} className={`scene ${className}`} role="img" aria-label={`Original pixel illustration of ${name}; artistic interpretation`}>
    {visible && <PixelScene locationId={locationId} />}
  </div>;
}
