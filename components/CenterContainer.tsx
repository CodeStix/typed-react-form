import React from "react";
import styled from "styled-components";

export interface CenterContainerProps {
    style?: React.CSSProperties;
}

const InnerContainer = styled.div`
    margin: 0 0.5em;
    display: flex;
    justify-content: center;
`;

const OuterContainer = styled.div`
    max-width: 1300px;
    width: 1300px;
`;

export function CenterContainer({ children, ...rest }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
    return (
        <InnerContainer {...rest}>
            <OuterContainer>{children}</OuterContainer>
        </InnerContainer>
    );
}
