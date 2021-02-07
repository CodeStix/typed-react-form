import React from "react";
import { InputHTMLAttributes } from "react";
import { DefaultState, FormState } from "./form";
import { useListener } from "./hooks";
import {} from "./index";

type BaldInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "form">;

export type InputProps<T, State, Error, Key extends keyof T> = BaldInputProps & {
    form: FormState<T, State, Error>;
    name: Key;
    errorClassName?: string;
    errorStyle?: React.CSSProperties;
    dirtyClassName?: string;
    dirtyStyle?: React.CSSProperties;
    disableOnSubmitting?: boolean;
    deserializer?: (value: T[Key]) => string;
    serializer?: (value: string) => T[Key];
};

function defaultSerializer(inputType: string | undefined, value: string) {
    switch (inputType) {
        case "number":
            return value ? parseFloat(value) : null;
        default:
            return value as any;
    }
}

export function Input<T, State extends DefaultState, Error, Key extends keyof T>({
    form,
    name,
    deserializer,
    serializer,
    style,
    className,
    disableOnSubmitting,
    errorClassName,
    errorStyle,
    dirtyClassName,
    dirtyStyle,
    ...rest
}: InputProps<T, State, Error, Key>) {
    const { value, error, dirty, state, setValue } = useListener(form, name);

    let cl = [];
    if (className) cl.push(className);
    if (dirty) cl.push(dirtyClassName ?? "is-dirty");
    if (error) cl.push(errorClassName ?? "is-error");

    return (
        <input
            style={{
                ...style,
                ...(dirty && dirtyStyle),
                ...(error && errorStyle)
            }}
            className={cl.join(" ")}
            disabled={(disableOnSubmitting ?? true) && state.isSubmitting}
            value={deserializer ? deserializer(value) : (value as any) || ""}
            onChange={(ev) => setValue(serializer ? serializer(ev.target.value) : defaultSerializer(rest.type, ev.target.value))}
            {...rest}
        />
    );
}
