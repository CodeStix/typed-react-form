import React from "react";
import { InputHTMLAttributes } from "react";
import { DefaultError, DefaultState, FormState } from "../form";
import { useListener } from "../hooks";
import { SerializeProps, defaultSerializer, defaultDeserializer, Serializer, Deserializer } from "./serializer";

export const DEFAULT_DIRTY_CLASS = "typed-form-dirty";
export const DEFAULT_ERROR_CLASS = "typed-form-error";

export function getClassName(...args: any) {
    return [...args].filter((e) => !!e).join(" ");
}

export type FormInputValue<T extends object, K extends keyof T> = T[K] extends any[] ? T[K][keyof T[K]] : T[K];

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "form" | "value" | "type">;

export type FormInputProps<T extends object, K extends keyof T = keyof T, State = DefaultState, Error extends string = string> = InputProps & {
    form: FormState<T, State, Error>;
    name: K;
    serializer?: Serializer<FormInputValue<T, K>>;
    deserializer?: Deserializer<FormInputValue<T, K>>;
    errorClassName?: string;
    errorStyle?: React.CSSProperties;
    dirtyClassName?: string;
    dirtyStyle?: React.CSSProperties;
    disableOnSubmitting?: boolean;
    hideWhenNull?: boolean;
} & SerializeProps<FormInputValue<T, K>>;

/**
 * The builtin form input. You must always specify **form** and **name**. Use the **type** prop to specify what type of field it represents.
 *
 * **FormSelect**, **FormTextArea** and **FormError** are also available.
 *
 * When this component does not satisfy your needs, you can always [implement your own](https://codestix.github.io/typed-react-form/examples/Custom-input#example-custom-input).
 */
export function FormInput<T extends object, K extends keyof T, State extends DefaultState = DefaultState, Error extends string = DefaultError>(
    props: FormInputProps<T, K, State, Error>
) {
    const {
        value: inputValue,
        checked: inputChecked,
        form,
        hideWhenNull,
        dirtyStyle,
        errorStyle,
        dirtyClassName,
        errorClassName,
        setNullOnUncheck,
        setUndefinedOnUncheck,
        className,
        disableOnSubmitting,
        serializer,
        deserializer,
        style,
        name,
        type,
        ...rest
    } = props;
    const { value: currentValue, error, dirty, state, setValue } = useListener(form, name);

    let valueChecked = (serializer ?? defaultSerializer)(currentValue as FormInputValue<T, K>, props);

    if (process.env.NODE_ENV === "development") {
        if ((setNullOnUncheck || setUndefinedOnUncheck) && type !== "checkbox")
            console.error("setNullOnUncheck/setUndefinedOnUncheck only has an effect on checkboxes.");
    }

    if (hideWhenNull && (currentValue === null || currentValue === undefined)) return null;

    return (
        <input
            style={{
                ...style,
                ...(dirty && dirtyStyle),
                ...(error && errorStyle)
            }}
            className={getClassName(className, dirty && (dirtyClassName ?? DEFAULT_DIRTY_CLASS), error && (errorClassName ?? DEFAULT_ERROR_CLASS))}
            disabled={(disableOnSubmitting ?? true) && state.isSubmitting}
            value={typeof valueChecked === "string" ? valueChecked : undefined}
            checked={typeof valueChecked === "boolean" ? valueChecked : undefined}
            onChange={(ev) => {
                setValue((deserializer ?? defaultDeserializer)(ev.target.value, ev.target.checked, currentValue as FormInputValue<T, K>, props));
            }}
            name={name as string}
            type={type}
            {...rest}
        />
    );
}
