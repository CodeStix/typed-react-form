import React from "react";
import { InputHTMLAttributes } from "react";
import { DefaultError, DefaultState, FormState } from "../form";
import { useListener } from "../hooks";

type BaldInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "form" | "value" | "type">;

export const DEFAULT_DIRTY_CLASS = "typed-form-dirty";
export const DEFAULT_ERROR_CLASS = "typed-form-error";

export function getClassName(...args: any) {
    return [...args].filter((e) => !!e).join(" ");
}

export type FormInputCheckMode = "normal" | "setNull" | "setUndefined";

export type FormInputType =
    | "number"
    | "text"
    | "password"
    | "date"
    | "datetime-local"
    | "radio"
    | "checkbox"
    | "color"
    | "email"
    | "text"
    | "month"
    | "url"
    | "week"
    | "time"
    | "tel"
    | "range";

function defaultSerializer(currentValue: any, props: FormInputProps<any>): boolean | string {
    switch (props.type) {
        case "datetime-local":
        case "date": {
            let dateValue = currentValue as any;
            if (typeof dateValue === "string") {
                let ni = parseInt(dateValue);
                if (!isNaN(ni)) dateValue = ni;
            }
            let date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
                return date?.toISOString().split("T")[0] ?? "";
            } else {
                return "";
            }
            break;
        }
        case "radio": {
            return currentValue === props.value;
        }
        case "checkbox": {
            if (props.setNullOnUncheck) {
                return currentValue !== null;
            } else if (props.setUndefinedOnUncheck) {
                return currentValue !== undefined;
            } else if (props.value !== undefined) {
                return (Array.isArray(currentValue) ? currentValue : []).includes(props.value as never);
            } else {
                return !!currentValue;
            }
        }
        default: {
            return (currentValue ?? "") + "";
        }
    }
}

function defaultDeserializer(inputValue: string, inputChecked: boolean, currentValue: any, props: FormInputProps<any>) {
    switch (props.type) {
        case "number": {
            return parseFloat(inputValue) as any;
        }
        case "datetime-local":
        case "date": {
            if (inputValue) {
                let d = new Date(inputValue);
                return (props.dateAsNumber ? d.getTime() : d) as any;
            } else {
                return null as any;
            }
        }
        case "radio": {
            // Enum field
            if (inputChecked) {
                return props.value as any;
            }
            return currentValue;
        }
        case "checkbox": {
            if (props.setNullOnUncheck || props.setUndefinedOnUncheck) {
                if (inputChecked && props.value === undefined && process.env.NODE_ENV === "development") {
                    console.error(
                        "Checkbox using setNullOnUncheck got checked but a value to set was not found, please provide a value to the value prop."
                    );
                }
                return inputChecked ? props.value : ((props.setNullOnUncheck ? null : undefined) as any);
            } else if (props.value !== undefined) {
                // Primitive array field
                let arr = Array.isArray(currentValue) ? [...currentValue] : [];
                if (inputChecked) arr.push(inputValue);
                else arr.splice(arr.indexOf(inputValue), 1);
                return arr as any;
            } else {
                // Boolean field
                return inputChecked as any;
            }
        }
        default: {
            // String field
            return inputValue as any;
        }
    }
}

export type FormInputProps<
    T extends object,
    K extends keyof T = keyof T,
    Value extends T[K] | T[K][keyof T[K]] = any,
    State = DefaultState,
    Error extends string = string
> = BaldInputProps & {
    form: FormState<T, State, Error>;
    name: K;
    type?: FormInputType;
    value?: Value;
    errorClassName?: string;
    errorStyle?: React.CSSProperties;
    dirtyClassName?: string;
    dirtyStyle?: React.CSSProperties;
    disableOnSubmitting?: boolean;
    dateAsNumber?: boolean;
    setNullOnUncheck?: boolean;
    setUndefinedOnUncheck?: boolean;
    hideWhenNull?: boolean;
};

/**
 * The builtin form input. You must always specify **form** and **name**. Use the **type** prop to specify what type of field it represents.
 *
 * **FormSelect**, **FormTextArea** and **FormError** are also available.
 *
 * When this component does not satisfy your needs, you can always [implement your own](https://typed-react-form.codestix.nl/docs/Custom-inputs#example-custom-input).
 */
export function FormInput<
    T extends object,
    K extends keyof T,
    Value extends T[K] | T[K][keyof T[K]],
    State extends DefaultState = DefaultState,
    Error extends string = DefaultError
>(props: FormInputProps<T, K, Value, State, Error>) {
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
        style,
        name,
        type,
        ...rest
    } = props;
    const { value: currentValue, error, dirty, state, setValue } = useListener(form, name);

    let valueChecked = defaultSerializer(currentValue, props);

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
            value={typeof valueChecked === "string" ? valueChecked : (inputValue as any)}
            checked={typeof valueChecked === "boolean" ? valueChecked : inputChecked}
            onChange={(ev) => {
                console.log("deserializing", inputValue, ev.target.value, ev.target.checked, currentValue);
                let dse = defaultDeserializer(ev.target.value, ev.target.checked, currentValue, props);
                console.log("deserialize", JSON.stringify(dse));
                setValue(dse);
            }}
            name={name + ""}
            type={type}
            {...rest}
        />
    );
}
