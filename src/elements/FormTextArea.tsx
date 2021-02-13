import React, { TextareaHTMLAttributes } from "react";
import { DefaultState, FormState } from "../form";
import { DEFAULT_DIRTY_CLASS, DEFAULT_ERROR_CLASS, getClassName } from "./FormInput";
import { useListener } from "../hooks";

export type FormTextAreaProps<T, State, Error> = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "form" | "name"> & {
    form: FormState<T, State, Error>;
    name: keyof T;
    errorClassName?: string;
    errorStyle?: React.CSSProperties;
    dirtyClassName?: string;
    dirtyStyle?: React.CSSProperties;
    disableOnSubmitting?: boolean;
};

export function FormTextArea<T, State extends DefaultState, Error>({
    form,
    name,
    errorClassName,
    errorStyle,
    dirtyClassName,
    dirtyStyle,
    disableOnSubmitting,
    children,
    className,
    style,
    ...rest
}: FormTextAreaProps<T, State, Error>) {
    const { value, setValue, state, dirty, error } = useListener(form, name);
    return (
        <textarea
            style={{
                ...style,
                ...(dirty && dirtyStyle),
                ...(error && errorStyle)
            }}
            className={getClassName(className, dirty && (dirtyClassName ?? DEFAULT_DIRTY_CLASS), error && (errorClassName ?? DEFAULT_ERROR_CLASS))}
            disabled={(disableOnSubmitting ?? true) && state.isSubmitting}
            value={value as any}
            onChange={(ev) => setValue(ev.target.value as any)}
            {...rest}
        >
            {children}
        </textarea>
    );
}
