import React, { SelectHTMLAttributes } from "react";
import { DefaultError, DefaultState, FormState } from "../form";
import { DEFAULT_DIRTY_CLASS, DEFAULT_ERROR_CLASS, getClassName } from "./FormInput";
import { useListener } from "../hooks";

export type FormSelectProps<T extends object, State, Error extends string> = Omit<SelectHTMLAttributes<HTMLSelectElement>, "form" | "name"> & {
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
 * The builtin form select. You must always specify **form** and **name**. Use the normal `<option>` element to specify its possible values.
 *
 * **FormInput**, **FormTextArea** and **FormError** are also available.
 *
 * When this component does not satisfy your needs, you can always [implement your own](https://codestix.github.io/typed-react-form/examples/Custom-input#example-custom-input).
 */
export function FormSelect<T extends object, State extends DefaultState = DefaultState, Error extends string = DefaultError>({
    form,
    name,
    errorClassName,
    errorStyle,
    dirtyClassName,
    dirtyStyle,
    disableOnSubmitting,
    hideWhenNull,
    children,
    className,
    style,
    ...rest
}: FormSelectProps<T, State, Error>) {
    const { value, setValue, state, dirty, error } = useListener(form, name);
    if (hideWhenNull && (value === null || value === undefined)) return null;
    return (
        <select
            name={name + ""}
            style={{
                ...style,
                ...(dirty && dirtyStyle),
                ...(error && errorStyle)
            }}
            className={getClassName(className, dirty && (dirtyClassName ?? DEFAULT_DIRTY_CLASS), error && (errorClassName ?? DEFAULT_ERROR_CLASS))}
            disabled={(disableOnSubmitting ?? true) && state.isSubmitting}
            value={value as any}
            onChange={(ev) => {
                if (rest.multiple) setValue(Array.from(ev.target.selectedOptions).map((e) => e.value) as any);
                else setValue(ev.target.value as any);
            }}
            {...rest}
        >
            {children}
        </select>
    );
}
