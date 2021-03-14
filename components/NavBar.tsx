import { CenterContainer } from "./CenterContainer";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGithubAlt, faGithubSquare } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { faBars, faBook } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

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

const NavItem = styled.a`
    display: block;
    padding: 0.8em;
    color: #195daa;
    cursor: pointer;

    &:hover {
        transition: 100ms;
        color: black;
    }
`;

const Container = styled.div`
    display: flex;
    align-items: center;
    border-bottom: 1px solid #0002;
`;

const Icon = styled(FontAwesomeIcon)`
    font-size: 2em;
    /* color: #195daa; */
`;

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
        <CenterContainer>
            <Container>
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
                        <Icon icon={faGithub} />
                    </NavItem>
                </Link>

                {windowWidth < 600 && (
                    <NavItem
                        onClick={(ev) => {
                            ev.stopPropagation();
                            props.onMenu();
                        }}>
                        <Icon icon={faBars} />
                    </NavItem>
                )}
            </Container>
        </CenterContainer>
    );
}
