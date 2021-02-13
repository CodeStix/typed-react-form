import React, { SelectHTMLAttributes } from "react";
import { DefaultState, FormState } from "../form";
import { DEFAULT_DIRTY_CLASS, DEFAULT_ERROR_CLASS, getClassName } from "./FormInput";
import { useListener } from "../hooks";

export type FormSelectProps<T, State, Error> = Omit<SelectHTMLAttributes<HTMLSelectElement>, "form" | "name"> & {
    form: FormState<T, State, Error>;
    name: keyof T;
    errorClassName?: string;
    errorStyle?: React.CSSProperties;
    dirtyClassName?: string;
    dirtyStyle?: React.CSSProperties;
    disableOnSubmitting?: boolean;
};

export function FormSelect<T, State extends DefaultState, Error>({
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
}: FormSelectProps<T, State, Error>) {
    const { value, setValue, state, dirty, error } = useListener(form, name);
    return (
        <select
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
