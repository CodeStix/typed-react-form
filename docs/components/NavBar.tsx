import { CenterContainer } from "./CenterContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGithubAlt, faGithubSquare } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { faBars, faBook } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";

function NavItem(props: { children?: React.ReactNode; onClick?: (ev: React.MouseEvent) => void }) {
    return (
        <a onClick={props.onClick} className="block p-4 text-blue-800 cursor-pointer hover:text-black transition">
            {props.children}
        </a>
    );
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
                    <span className="cursor-poiner p-4 font-bold font-lg text-blue-800 mr-auto">
                        <FontAwesomeIcon icon={faBook} />
                        &nbsp;Typed React Form
                    </span>
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
