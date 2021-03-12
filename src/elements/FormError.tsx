import React, { HTMLAttributes } from "react";
import { DefaultError, FormState } from "../form";
import { useListener } from "../hooks";

export type FormErrorProps<T, Key extends keyof T, Error extends string = DefaultError> = Omit<
    HTMLAttributes<HTMLParagraphElement>,
    "name" | "form"
> & {
    form: FormState<T, any, Error>;
    name: Key;
};

/**
 * The builtin form error. You must always specify **form** and **name**.
 *
 * **FormInput**, **FormTextArea** and **FormSelect** are also available.
 *
 * When this error component is too basic for your needs, you can always [create your own](https://github.com/CodeStix/typed-react-form/wiki/FormError#custom-error-component).
 */
export function FormError<T, Key extends keyof T, Error extends string = DefaultError>({ form, name, ...rest }: FormErrorProps<T, Key, Error>) {
    const { error } = useListener(form, name);
    if (!error || typeof error === "object") return null;
    return <p {...rest}>{error + ""}</p>;
}
