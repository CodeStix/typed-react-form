import React from "react";
import { DefaultError, DefaultState, FormState } from "../form";
import { useListener } from "../hooks";
import { ElementProps } from "./Field";

export function FieldError<
    T extends object,
    K extends keyof T,
    C extends React.FunctionComponent<any> | keyof JSX.IntrinsicElements,
    Error extends string = DefaultError,
    State = DefaultState
>(
    props: {
        form: FormState<T, State, Error>;
        name: K;
        component?: C;
        transformer?: (error: Error) => React.ReactNode;
    } & Omit<ElementProps<C>, "transformer" | "component" | "name" | "form">
) {
    const { form, component = React.Fragment, transformer } = props;
    const { error } = useListener(form, props.name);
    if (!error || typeof error === "object") return null;
    return React.createElement(component, { children: String(transformer ? transformer(error as Error) : error) });
}
