import { GetStaticProps, GetServerSideProps, GetStaticPaths } from "next";
import fs from "fs/promises";
import path from "path";
import ReactMarkdown from "react-markdown";
import React from "react";
import { CenterContainer } from "../../components/CenterContainer";
import { NavBar } from "../../components/NavBar";
import { SideBar } from "../../components/SideBar";
import styled from "styled-components";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialOceanic } from "react-syntax-highlighter/dist/cjs/styles/prism";

const ARTICLES_PATH = path.join(process.cwd(), "articles");

interface Props {
    content: string;
}

const Container = styled.div`
    display: grid;
    gap: 3em;
    grid-template-columns: 200px 1fr;
`;

const ReactMarkdownContainer = styled.div`
    overflow: hidden;

    code {
        font-size: 1.3em;
    }

    a {
        color: #0084ff;
        /* font-weight: bold; */
        border-bottom: 1px solid #0084ff;
    }

    hr {
        margin: 2em 0;
        border: 1px solid #0002;
    }
`;

export default function DocPage(props: Props) {
    return (
        <>
            <NavBar />
            <CenterContainer style={{ margin: "2em 0.5em" }}>
                <Container>
                    <div>
                        <SideBar />
                    </div>
                    <ReactMarkdownContainer>
                        <ReactMarkdown
                            renderers={{
                                code: ({ language, value }) => {
                                    return <SyntaxHighlighter style={materialOceanic} language={language} children={value} />;
                                },
                            }}>
                            {props.content}
                        </ReactMarkdown>
                    </ReactMarkdownContainer>
                </Container>
            </CenterContainer>
        </>
    );
}

export const getStaticProps: GetStaticProps<Props> = async function (props) {
    let title = props.params!.doc as string;
    let file = path.join(ARTICLES_PATH, title + ".md");
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
