import React from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useRouter } from "next/router";

const CATEGORIES = [
    {
        category: "Basic",
        items: [
            { name: "Getting started", url: "/docs/Getting-started" },
            { name: "FormInput", url: "/docs/FormInput" },
            { name: "FormTextArea", url: "/docs/FormTextArea" },
            { name: "FormSelect", url: "/docs/FormSelect" },
            { name: "FormError", url: "/docs/FormError" },
            { name: "Field toggling", url: "/docs/Toggling-a-field" },
            { name: "Object fields", url: "/docs/Object-fields" },
            { name: "Array fields", url: "/docs/Array-fields" },
            { name: "styled-components", url: "/docs/Problem-with-styled-components" },
        ],
    },
    {
        category: "Validation",
        items: [
            { name: "Validation", url: "/docs/Validation" },
            { name: "yup", url: "/docs/yup" },
        ],
    },
    {
        category: "Examples",
        items: [
            { name: "Custom input", url: "/docs/Custom-input" },
            { name: "Live JSON display", url: "/docs/Live-json-component" },
            { name: "Auto disabling submit button", url: "/docs/Auto-disable-submit-button" },
        ],
    },
    {
        category: "Reference",
        items: [
            { name: "FormState", url: "/docs/FormState" },
            { name: "ChildFormState", url: "/docs/FormState#childformstate" },
            { name: "useForm", url: "/docs/useForm" },
            { name: "useChildForm", url: "/docs/useChildForm" },
            { name: "useListener", url: "/docs/useListener" },
            { name: "useAnyListener", url: "/docs/useAnyListener" },
            { name: "useArrayForm", url: "/docs/useArrayForm" },
            { name: "ChildForm", url: "/docs/ChildForm" },
            // { name: "Listener", url: "/docs/Listener" },
            // { name: "AnyListener", url: "/docs/AnyListener" },
            { name: "ArrayForm", url: "/docs/ArrayForm" },
            { name: "FormInput", url: "/docs/FormInput" },
            { name: "FormSelect", url: "/docs/FormSelect" },
            { name: "FormTextArea", url: "/docs/FormTextArea" },
            { name: "FormError", url: "/docs/FormError" },
        ],
    },
];

const Container = styled.div`
    position: sticky;
    top: 1em;
`;

const Item = styled.a<{ current: boolean }>`
    display: block;
    padding: 0.4em 0.8em;
    color: #111;
    border-bottom: 1px solid #0002;
    cursor: pointer;
    text-decoration: none;

    ${(e) => e.current && "background: #0972d422; border: none;"}

    &:hover {
        transition: 50ms;
        /* background: #0001; */
        /* transform: translateX(3px); */
        color: #0972d4;
    }
`;

const Category = styled.div`
    margin: 1.2em 0 0 0;
    padding: 0.4em 0;
    font-weight: bold;
`;

export function SideBar() {
    let router = useRouter();

    return (
        <Container>
            {CATEGORIES.map((e) => (
                <>
                    <Category>{e.category}</Category>
                    {e.items.map((e) => (
                        <Link href={e.url} passHref>
                            <Item current={router.asPath === e.url}>{e.name}</Item>
                        </Link>
                    ))}
                </>
            ))}
        </Container>
    );
}
