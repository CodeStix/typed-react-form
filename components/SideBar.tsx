import React from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";

const Sidebar = {
    Home: "",
};

const Container = styled.div`
    margin: 1em 0;
    position: sticky;
    top: 1em;
`;

const Item = styled.div`
    padding: 0.4em 0.8em;
    color: #111;
    border-bottom: 1px solid #0002;
    cursor: pointer;

    &:hover {
        transition: 50ms;
        /* background: #0001; */
        transform: translateX(3px);
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
