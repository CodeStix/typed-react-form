import React from "react";
import styled from "styled-components";

const Container = styled.div`
    margin: 2em 0;
    position: sticky;
    top: 1em;
`;

const Item = styled.div`
    padding: 0.4em 0.8em;
    color: #111;
    border-bottom: 1px solid #0002;
    cursor: pointer;

    &:hover {
        transition: 100ms;
        background: #0001;
        color: #0972d4;
    }
`;

export function SideBar() {
    return (
        <Container>
            <Item>Item 1</Item>
            <Item>Item 2</Item>
        </Container>
    );
}
