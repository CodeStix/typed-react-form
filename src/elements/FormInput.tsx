import React, { useMemo } from "react";
import { InputHTMLAttributes } from "react";
import { DefaultState, FormState } from "../form";
import { useListener } from "../hooks";

type BaldInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "form" | "value">;

export const DEFAULT_DIRTY_CLASS = "typed-form-dirty";
export const DEFAULT_ERROR_CLASS = "typed-form-error";

export function getClassName(...args: any) {
    return [...args].filter((e) => !!e).join(" ");
}

export type FormInputCheckMode = "normal" | "setNull" | "setUndefined";

export type FormInputProps<T, State, Error, Key extends keyof T, Value extends T[Key] | T[Key][keyof T[Key]]> = BaldInputProps & {
    form: FormState<T, State, Error>;
    name: Key;
    value?: Value;
    errorClassName?: string;
    errorStyle?: React.CSSProperties;
    dirtyClassName?: string;
    dirtyStyle?: React.CSSProperties;
    disableOnSubmitting?: boolean;
    dateAsNumber?: boolean;
    setNullOnUncheck?: boolean;
    setUndefinedOnUncheck?: boolean;
};

export function FormInput<T, State extends DefaultState, Error, Key extends keyof T, Value extends T[Key] | T[Key][keyof T[Key]]>({
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
    value: inputValue,
    checked: inputChecked,
    ...rest
}: FormInputProps<T, State, Error, Key, Value>) {
    const { value: currentValue, error, dirty, state, setValue } = useListener(form, name);
    let [inValue, inChecked] = useMemo(() => {
        let inValue = undefined,
            inChecked = undefined;
        switch (rest.type) {
            case "number": {
                inValue = (currentValue ?? "") + "";
                break;
            }
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
                if (setNullOnUncheck || setUndefinedOnUncheck) {
                    inChecked = !!currentValue;
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

    if ((setNullOnUncheck || setUndefinedOnUncheck) && rest.type !== "checkbox") console.warn("setNullOnUncheck/setUndefinedOnUncheck only has an effect on checkboxes.");

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
                            if (inputValue === undefined) console.warn(`You should set a value when using setNullOnUncheck/setUndefinedOnUncheck on field ${name}`);
                            setValue(newChecked ? inputValue : ((setNullOnUncheck ? null : undefined) as any));
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
            name={name as string}
            {...rest}
        />
    );
}
