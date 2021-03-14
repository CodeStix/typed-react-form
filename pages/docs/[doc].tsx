import { GetStaticProps, GetServerSideProps, GetStaticPaths } from "next";
import fs from "fs/promises";
import path from "path";
import ReactMarkdown from "react-markdown";
import React from "react";
import { CenterContainer } from "../../components/CenterContainer";
import { NavBar } from "../../components/NavBar";
import { SideBar } from "../../components/SideBar";
import styled from "styled-components";

const ARTICLES_PATH = path.join(process.cwd(), "articles");

interface Props {
    content: string;
}

const Container = styled.div`
    display: grid;
    gap: 2em;
    grid-template-columns: 200px 1fr;
`;

export default function DocPage(props: Props) {
    return (
        <>
            <NavBar />
            <CenterContainer style={{ margin: "2em 0" }}>
                <Container>
                    <div>
                        <SideBar />
                    </div>
                    <div style={{ overflow: "hidden" }}>
                        <ReactMarkdown>{props.content}</ReactMarkdown>;
                    </div>
                </Container>
            </CenterContainer>
        </>
    );
}

export const getStaticProps: GetStaticProps<Props> = async function (props) {
    let file = path.join(ARTICLES_PATH, props.params!.doc + ".md");
    return {
        props: {
            content: await fs.readFile(file, "utf-8"),
        },
    };
};

export const getStaticPaths: GetStaticPaths = async function () {
    let files = await fs.readdir(ARTICLES_PATH);
    return {
        paths: files.filter((e) => e.endsWith(".md")).map((e) => "/docs/" + e.slice(0, e.length - 3)),
        fallback: false,
    };
};
