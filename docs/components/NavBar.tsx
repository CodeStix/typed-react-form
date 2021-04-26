import { CenterContainer } from "./CenterContainer";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGithubAlt, faGithubSquare } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { faBars, faBook } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";

const Name = styled.span`
    cursor: pointer;
    padding: 0.8em;
    font-weight: bold;
    font-size: 1.5rem;
    color: #2065af;
    margin-right: auto;

    @media only screen and (max-width: 600px) {
        font-size: 1.2rem;
    }
`;

function NavItem(props: { children?: React.ReactNode }) {
    return <a className="block p-4 text-blue-600 cursor-pointer hover:text-black transition">{props.children}</a>;
}

function useWindowWidth() {
    const [windowWidth, setWindowWidth] = useState(1200);
    useEffect(() => {
        setWindowWidth(window.innerWidth);
    }, []);
    return windowWidth;
}

export function NavBar(props: { onMenu: () => void }) {
    const windowWidth = useWindowWidth();
    return (
        <CenterContainer className="">
            <div className="flex items-center border-b">
                <Link href="/">
                    <Name>
                        <FontAwesomeIcon icon={faBook} />
                        &nbsp;Typed React Form
                    </Name>
                </Link>

                {/* <Link href="https://github.com/codestix/typed-react-form" passHref>
                    <NavItem>GitHub</NavItem>
                </Link> */}

                <Link href="https://github.com/codestix/typed-react-form" passHref>
                    <NavItem>
                        <FontAwesomeIcon icon={faGithub} />
                    </NavItem>
                </Link>

                {windowWidth < 600 && (
                    <NavItem
                        onClick={(ev) => {
                            ev.stopPropagation();
                            props.onMenu();
                        }}
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </NavItem>
                )}
            </div>
        </CenterContainer>
    );
}
