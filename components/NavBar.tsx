import { CenterContainer } from "./CenterContainer";
import styled from "styled-components";

const Name = styled.span`
    margin: 0.8em 0;
    font-weight: bold;
    font-size: 1.5rem;
    color: #2065af;
    margin-right: auto;
`;

const NavItem = styled.div`
    padding: 1em;
    color: #195daa;
`;

const Container = styled.div`
    display: flex;
    align-items: center;
    border-bottom: 1px solid #0002;
`;

export function NavBar() {
    return (
        <CenterContainer>
            <Container>
                <Name>Typed React form</Name>
                <NavItem>Test</NavItem>
                <NavItem>GitHub</NavItem>
            </Container>
        </CenterContainer>
    );
}
