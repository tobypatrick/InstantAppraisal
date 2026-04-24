 import { useState, useEffect } from "react";
 
 /**
  * Custom hook for debouncing values
  * Used for search inputs and other rapid-update scenarios
  */
 export function useDebounce<T>(value: T, delay: number): T {
   const [debouncedValue, setDebouncedValue] = useState<T>(value);
 
   useEffect(() => {
     const handler = setTimeout(() => {
       setDebouncedValue(value);
     }, delay);
 
     return () => clearTimeout(handler);
   }, [value, delay]);
 
   return debouncedValue;
 }