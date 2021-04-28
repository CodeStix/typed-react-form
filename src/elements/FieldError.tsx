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
        as?: C;
        transformer?: (error: Error) => React.ReactNode;
    } & Omit<ElementProps<C>, "transformer" | "as" | "name" | "form" | "children">
) {
    const { form, as = React.Fragment, transformer, ...rest } = props;
    const { error } = useListener(form, props.name);
    if (!error || typeof error === "object") return null;
    return React.createElement(as, { ...rest, children: String(transformer ? transformer(error as Error) : error) });
}
