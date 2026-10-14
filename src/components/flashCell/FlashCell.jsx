import { useEffect, useRef } from "react";

export default function FlashCell({ children, className = "", flashKey }) {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;
        const el = ref.current;
        el.classList.add("flash-active");
        const timer = setTimeout(() => {
            el.classList.remove("flash-active");
        }, 300);
        return () => clearTimeout(timer);
    }, [flashKey]);

    return (
        <td ref={ref} className={`flash-container ${className}`}>
            {children}
        </td>
    );
}