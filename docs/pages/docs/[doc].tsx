import { GetStaticProps, GetServerSideProps, GetStaticPaths } from "next";
import fs from "fs/promises";
import path from "path";
import ReactMarkdown from "react-markdown";
import React, { useEffect, useState } from "react";
import { CenterContainer } from "../../components/CenterContainer";
import { NavBar } from "../../components/NavBar";
import { SideBar } from "../../components/SideBar";
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

export default function DocPage(props: Props) {
    const [showMobileMenu, setShowMobileMenu] = useState(true);
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
                <div className="flex">
                    <div
                        className={`md:block md:static top-0 left-0 z-30 h-full overflow-auto fixed p-3 transform translate-x-0 transition`}
                        style={{ display: showMobileMenu ? "" : "none" }}
                    >
                        <SideBar />
                    </div>
                    <div className="markdown relative block overflow-hidden mb-72">
                        <Link
                            passHref
                            href={`https://github.com/CodeStix/typed-react-form-docs/tree/main/articles/${props.title}.md`}
                        >
                            <a className="no-underline text-blue-700 absolute p-0 top-2 right-2 cursor-pointer">
                                Edit <FontAwesomeIcon icon={faPen} />
                            </a>
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
                    </div>
                </div>
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
