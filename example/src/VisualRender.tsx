import React, { useRef } from "react";

export function VisualRender(props: { children: React.ReactNode }) {
    let ref = useRef<HTMLDivElement>(null);
    let timeoutRef = useRef<number | null>(null);

    if (ref.current) {
        ref.current.className = "";
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
            ref.current && (ref.current.className = "blink");
        }, 100);
    }

    return (
        <div className="blink" ref={ref}>
            {props.children}
        </div>
    );
}
