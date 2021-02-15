import React, { HTMLAttributes } from "react";
import { FormState } from "../form";
import { useListener } from "../hooks";

export type FormErrorProps<T, Error, Key extends keyof T> = Omit<HTMLAttributes<HTMLParagraphElement>, "name" | "form"> & {
    form: FormState<T, any, Error>;
    name: Key;
};

export function FormError<T, Error, Key extends keyof T>({ form, name, ...rest }: FormErrorProps<T, Error, Key>) {
    const { error } = useListener(form, name);
    if (!error) return null;
    return <p {...rest}>{error + ""}</p>;
}
