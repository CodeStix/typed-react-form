import React from "react";
import styled from "styled-components";

export function CenterContainer({
    children,
    ref,
    ...rest
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
    return (
        <div className="mx-2 flex justify-center" {...rest}>
            <div style={{ maxWidth: "1175px", width: "1175px" }}>{children}</div>
        </div>
    );
}
