import { CenterContainer } from "./CenterContainer";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGithubAlt, faGithubSquare } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { faBook } from "@fortawesome/free-solid-svg-icons";

const Name = styled.span`
    cursor: pointer;
    padding: 0.8em;
    font-weight: bold;
    font-size: 1.5rem;
    color: #2065af;
    margin-right: auto;
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

export function NavBar() {
    return (
        <CenterContainer>
            <Container>
                <Link href="/">
                    <Name>
                        <FontAwesomeIcon icon={faBook} />
                        &nbsp;Typed React Form
                    </Name>
                </Link>
                <Link href="https://github.com/codestix/typed-react-form" passHref>
                    <NavItem>GitHub</NavItem>
                </Link>
                <Link href="https://github.com/codestix/typed-react-form" passHref>
                    <NavItem>
                        <Icon icon={faGithub} />
                    </NavItem>
                </Link>
            </Container>
        </CenterContainer>
    );
}
