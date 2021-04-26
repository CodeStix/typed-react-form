import React from "react";
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
        ],
    },
    {
        category: "Advanced",
        items: [
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
            { name: "Using yup", url: "/docs/yup" },
            { name: "Using typed-object-validator", url: "/docs/typed-object-validator" },
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

export function SideBar() {
    let router = useRouter();

    return (
        <div className="sticky top-0 max-h-screen overflow-auto pr-4">
            {CATEGORIES.map((e, i) => (
                <React.Fragment key={i}>
                    <div className="mt-6 py-3 font-bold">{e.category}</div>
                    {e.items.map((e, i) => (
                        <Link key={i} href={e.url} passHref>
                            <a
                                className={`block px-4 py-2 text-gray-900 border-b cursor-pointer  no-underline ${
                                    router.asPath === e.url ? "bg-blue-100" : ""
                                } hover:text-blue-900 transition`}
                            >
                                {e.name}
                            </a>
                        </Link>
                    ))}
                </React.Fragment>
            ))}
        </div>
    );
}
