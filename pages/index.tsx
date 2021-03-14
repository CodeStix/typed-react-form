import Head from "next/head";
import React from "react";
import { CenterContainer } from "../components/CenterContainer";
import { NavBar } from "../components/NavBar";

export default function Home() {
    return (
        <>
            <NavBar />
            <CenterContainer style={{ margin: "2em 0" }}>
                <h2>Welcome to the docs!</h2>
                <p>Here you can find the docs</p>
            </CenterContainer>
        </>
    );
}
