import React, { useMemo } from "react";
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

export type FormInputProps<
    T extends object,
    State,
    Error extends string,
    K extends keyof T,
    Value extends T[K] | T[K][keyof T[K]]
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
 * When this component does not satisfy your needs, you can always [create your own](https://github.com/CodeStix/typed-react-form/wiki/Custom-inputs#example-custom-input).
 */
export function FormInput<
    T extends object,
    K extends keyof T,
    Value extends T[K] | T[K][keyof T[K]],
    State extends DefaultState = DefaultState,
    Error extends string = DefaultError
>({
    form,
    name,
    style,
    className,
    disableOnSubmitting,
    dateAsNumber,
    errorClassName,
    errorStyle,
    dirtyClassName,
    dirtyStyle,
    setUndefinedOnUncheck,
    setNullOnUncheck,
    hideWhenNull,
    value: inputValue,
    checked: inputChecked,
    ...rest
}: FormInputProps<T, State, Error, K, Value>) {
    const { value: currentValue, error, dirty, state, setValue, defaultValue } = useListener(form, name);

    let [inValue, inChecked] = useMemo(() => {
        let inValue = undefined,
            inChecked = undefined;
        switch (rest.type) {
            case "number": {
                inValue = (currentValue ?? "") + "";
                break;
            }
            case "datetime-local":
            case "date": {
                let n = currentValue as any;
                if (typeof n === "string") {
                    let ni = parseInt(n);
                    if (!isNaN(ni)) n = ni;
                }
                let d = new Date(n);
                if (d.getTime() === d.getTime()) {
                    // Trick to check if date is valid: NaN === NaN returns false
                    inValue = d?.toISOString().split("T")[0] ?? "";
                } else {
                    inValue = "";
                }
                break;
            }
            case "radio": {
                inChecked = currentValue === inputValue;
                break;
            }
            case "checkbox": {
                if (setNullOnUncheck) {
                    inChecked = currentValue !== null;
                } else if (setUndefinedOnUncheck) {
                    inChecked = currentValue !== undefined;
                } else if (inputValue !== undefined) {
                    inChecked = (Array.isArray(currentValue) ? currentValue : []).includes(inputValue as never);
                } else {
                    inChecked = !!currentValue;
                }
                break;
            }
            default: {
                inValue = (currentValue ?? "") + "";
                break;
            }
        }
        return [inValue, inChecked];
    }, [rest.type, currentValue, inputValue]);

    if (hideWhenNull && (currentValue === null || currentValue === undefined)) return null;

    if ((setNullOnUncheck || setUndefinedOnUncheck) && rest.type !== "checkbox")
        console.warn("setNullOnUncheck/setUndefinedOnUncheck only has an effect on checkboxes.");

    return (
        <input
            style={{
                ...style,
                ...(dirty && dirtyStyle),
                ...(error && errorStyle)
            }}
            className={getClassName(className, dirty && (dirtyClassName ?? DEFAULT_DIRTY_CLASS), error && (errorClassName ?? DEFAULT_ERROR_CLASS))}
            disabled={(disableOnSubmitting ?? true) && state.isSubmitting}
            value={inValue}
            checked={inChecked}
            onChange={(ev) => {
                let newValue = ev.target.value;
                let newChecked = ev.target.checked;
                switch (rest.type) {
                    case "number": {
                        setValue(parseFloat(newValue) as any);
                        return;
                    }
                    case "datetime-local":
                    case "date": {
                        if (newValue) {
                            let d = new Date(newValue);
                            setValue((dateAsNumber ? d.getTime() : d) as any);
                        } else {
                            setValue(null as any);
                        }
                        return;
                    }
                    case "radio": {
                        // Enum field
                        if (newChecked) {
                            setValue(inputValue as any);
                        }
                        return;
                    }
                    case "checkbox": {
                        if (setNullOnUncheck || setUndefinedOnUncheck) {
                            if (newChecked && inputValue === undefined && !defaultValue)
                                console.warn(
                                    "Toggling checkbox using setNullOnUncheck got checked but a value to set was not found, please provide the value prop"
                                );
                            setValue(
                                newChecked ? (inputValue !== undefined ? inputValue : defaultValue) : ((setNullOnUncheck ? null : undefined) as any)
                            );
                        } else if (inputValue !== undefined) {
                            // Primitive array field
                            let arr = Array.isArray(currentValue) ? [...currentValue] : [];
                            if (newChecked) arr.push(inputValue);
                            else arr.splice(arr.indexOf(inputValue), 1);
                            setValue(arr as any);
                        } else {
                            // Boolean field
                            setValue(newChecked as any);
                        }
                        return;
                    }
                    default: {
                        // String field
                        setValue(newValue as any);
                        return;
                    }
                }
            }}
            name={name + ""}
            {...rest}
        />
    );
}
