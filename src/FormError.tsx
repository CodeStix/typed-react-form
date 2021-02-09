import React, { HTMLAttributes } from "react";
import { ErrorType, FormState } from "./form";
import { useListener } from "./hooks";

export type FormErrorProps<T, Error, Key extends keyof T> = Omit<HTMLAttributes<HTMLParagraphElement>, "name" | "form"> & {
    form: FormState<T, any, Error>;
    name: Key;
    deserializer?: (error: ErrorType<T[Key], Error> | undefined) => React.ReactNode;
};

export function FormError<T, Error, Key extends keyof T>({ form, name, deserializer, ...rest }: FormErrorProps<T, Error, Key>) {
    const { error } = useListener(form, name);
    if (!form.error) return null;
    return <p {...rest}>{deserializer ? deserializer(error) : error}</p>;
}
