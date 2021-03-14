import { GetStaticProps, GetServerSideProps, GetStaticPaths } from "next";
import fs from "fs/promises";
import path from "path";
import ReactMarkdown from "react-markdown";
import React, { useEffect, useState } from "react";
import { CenterContainer } from "../../components/CenterContainer";
import { NavBar } from "../../components/NavBar";
import { SideBar } from "../../components/SideBar";
import styled from "styled-components";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialOceanic } from "react-syntax-highlighter/dist/cjs/styles/prism";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";

const ARTICLES_PATH = path.join(process.cwd(), "articles");

interface Props {
    content: string;
}

const Container = styled.div`
    display: grid;
    gap: 3em;
    grid-template-columns: 200px 1fr;

    @media only screen and (max-width: 600px) {
        grid-template-columns: 1fr;
        /* display: block; */
        /* max-width: 100vw; */
    }
`;

const ReactMarkdownContainer = styled.div`
    display: block;
    overflow: hidden;
    margin-bottom: 30em;

    code {
        font-size: 1.3em;
    }

    /* @media only screen and (max-width: 600px) {
        pre {
            margin: 0 -2em !important;
        }
    } */

    a {
        padding: 0.3em 0;
        color: #186eee;
        text-decoration: 1px solid underline;
    }

    hr {
        margin: 2em 0;
        border: 1px solid #0002;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        margin: 1.2em 0 0.5em 0;
    }

    h1,
    h2 {
        padding-bottom: 0.2em;
        border-bottom: 1px solid #0002;
    }
`;

const SidebarHolder = styled.div`
    @media only screen and (max-width: 600px) {
        top: 0em;
        left: 0em;
        width: 100%;
        z-index: 100;
        backdrop-filter: blur(50px);
        height: 100%;
        position: fixed;
        padding: 1em;
        transform: translateX(0);
        transition: 100ms ease-in;
        &.hidden {
            transition: 100ms ease-in;
            transform: translateX(-100vw);
        }
    }
`;

export default function DocPage(props: Props) {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    return (
        <main onClick={() => setShowMobileMenu(false)}>
            <Head>
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link href="https://fonts.googleapis.com/css2?family=Open+Sans&family=Roboto&display=swap" rel="stylesheet" />
            </Head>
            <NavBar onMenu={() => setShowMobileMenu(true)} />
            <CenterContainer style={{ margin: "0 0.5em" }}>
                <Container>
                    <SidebarHolder className={!showMobileMenu && "hidden"}>
                        <SideBar />
                    </SidebarHolder>
                    <ReactMarkdownContainer>
                        <ReactMarkdown
                            renderers={{
                                link: ({ children, href }) => {
                                    return (
                                        <Link href={href}>
                                            <a>{children}</a>
                                        </Link>
                                    );
                                },
                                code: ({ language, value }) => {
                                    return <SyntaxHighlighter style={materialOceanic} language={language} children={value} />;
                                },
                            }}>
                            {props.content}
                        </ReactMarkdown>
                    </ReactMarkdownContainer>
                </Container>
            </CenterContainer>
        </main>
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
