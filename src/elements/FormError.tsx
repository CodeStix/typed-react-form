import React, { HTMLAttributes } from "react";
import { FormState } from "../form";
import { useListener } from "../hooks";

export type FormErrorProps<T, Error, Key extends keyof T> = Omit<HTMLAttributes<HTMLParagraphElement>, "name" | "form"> & {
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
export function FormError<T, Error, Key extends keyof T>({ form, name, ...rest }: FormErrorProps<T, Error, Key>) {
    const { error } = useListener(form, name);
    if (!error || typeof error === "object") return null;
    return <p {...rest}>{error + ""}</p>;
}
