import Head from "next/head";
import React from "react";
import styled from "styled-components";
import { CenterContainer } from "../components/CenterContainer";
import { NavBar } from "../components/NavBar";
import { SideBar } from "../components/SideBar";

const Container = styled.div`
    display: grid;
    gap: 2em;
    grid-template-columns: 250px 1fr;
`;

export default function Home() {
    return (
        <>
            <NavBar />
            <CenterContainer style={{ margin: "2em 0" }}>
                <Container>
                    <SideBar />
                    <div>
                        <h2>Welcome to the docs!</h2>
                        <p>Here you can find the docs</p>
                    </div>
                </Container>
            </CenterContainer>
        </>
    );
}
