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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";

const ARTICLES_PATH = path.join(process.cwd(), "articles");

interface Props {
    content: string;
    title: string;
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
    position: relative;
    display: block;
    overflow: hidden;
    margin-bottom: 30em;

    pre {
        border-radius: 0.3em;
    }

    code {
        display: inline-block;
        padding: 0.1em 0.5em;
        background: #0001;
        border-radius: 0.5em;
        font-size: 1.2em;
    }

    /* @media only screen and (max-width: 600px) {
        pre {
            margin: 0 -2em !important;
        }
    } */

    a {
        padding: 0.3em 0;
        color: #186eee;
        &:hover {
            color: black;
        }
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
        /* color: #004; */
        padding-bottom: 0.2em;
        border-bottom: 1px solid #0002;
    }

    p {
        color: #333;
    }

    li {
        margin-top: 0.2em;
        margin-bottom: 0.2em;
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
        overflow: auto;
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

const Edit = styled.a`
    text-decoration: none;
    color: #186eee;
    position: absolute;
    padding: 0 !important;
    top: 0.8em;
    right: 0.8em;
    cursor: pointer;
`;

export default function DocPage(props: Props) {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    return (
        <main onClick={() => setShowMobileMenu(false)}>
            <Head>
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Open+Sans&family=Roboto&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <NavBar onMenu={() => setShowMobileMenu(true)} />
            <CenterContainer style={{ margin: "0 0.5em" }}>
                <Container>
                    <SidebarHolder className={!showMobileMenu && "hidden"}>
                        <SideBar />
                    </SidebarHolder>
                    <ReactMarkdownContainer>
                        <Link
                            passHref
                            href={`https://github.com/CodeStix/typed-react-form-docs/tree/main/articles/${props.title}.md`}
                        >
                            <Edit>
                                Edit <FontAwesomeIcon icon={faPen} />
                            </Edit>
                        </Link>
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
                                    return (
                                        <SyntaxHighlighter
                                            style={materialOceanic}
                                            language={language}
                                            children={value}
                                        />
                                    );
                                },
                            }}
                        >
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
            title,
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
