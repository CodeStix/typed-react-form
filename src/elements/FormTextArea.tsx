import React, { TextareaHTMLAttributes } from "react";
import { DefaultError, DefaultState, FormState } from "../form";
import { DEFAULT_DIRTY_CLASS, DEFAULT_ERROR_CLASS, getClassName } from "./FormInput";
import { useListener } from "../hooks";

export type FormTextAreaProps<T, State, Error extends string> = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "form" | "name"> & {
    form: FormState<T, State, Error>;
    name: keyof T;
    errorClassName?: string;
    errorStyle?: React.CSSProperties;
    dirtyClassName?: string;
    dirtyStyle?: React.CSSProperties;
    disableOnSubmitting?: boolean;
    hideWhenNull?: boolean;
};

/**
 * The builtin form textarea. You must always specify **form** and **name**.
 *
 * **FormSelect**, **FormInput** and **FormError** are also available.
 *
 * When this component does not satisfy your needs, you can always [create your own](https://github.com/CodeStix/typed-react-form/wiki/Custom-inputs#example-custom-input).
 */
export function FormTextArea<T, State extends DefaultState = DefaultState, Error extends string = DefaultError>({
    form,
    name,
    errorClassName,
    errorStyle,
    dirtyClassName,
    dirtyStyle,
    disableOnSubmitting,
    children,
    className,
    hideWhenNull,
    style,
    ...rest
}: FormTextAreaProps<T, State, Error>) {
    const { value, setValue, state, dirty, error } = useListener(form, name);
    if (hideWhenNull && (value === null || value === undefined)) return null;
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
