import React from "react";
import { DefaultError, DefaultState, FormState } from "./form";
import { useListener } from "./hooks";
import { ElementProps } from "./Field";

export function FieldError<
    T extends object,
    K extends keyof T,
    C extends React.FunctionComponent<any> | keyof JSX.IntrinsicElements,
    Error extends DefaultError = DefaultError,
    State extends DefaultState = DefaultState
>(
    props: {
        /**
         * The form to make a field for
         */
        form: FormState<T, State, Error>;
        /**
         * The name of the field
         */
        name: K;
        /**
         * The element to create, this can be a string specifying a tag "p", "span", "div" ... or a custom component. Is React.Fragment (`<></>`) by default. The props of the passed custom component are available on this field.
         *
         * **Examples**
         *
         * `<FieldError as="span" style={{color: "red"}} />`
         *
         * `<FieldError as={CustomError} {...} />`
         */
        as?: C;
        transformer?: (error: Error) => React.ReactNode;
    } & Omit<ElementProps<C>, "transformer" | "as" | "name" | "form" | "children">
) {
    const { form, as = React.Fragment, transformer, ...rest } = props;
    const { error } = useListener(form, props.name);
    if (!error || typeof error === "object") return null;
    return React.createElement(as, { ...rest, children: String(transformer ? transformer(error as Error) : error) });
}
