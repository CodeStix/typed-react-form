import React, { useMemo } from "react";
import { InputHTMLAttributes } from "react";
import { DefaultState, FormState } from "./form";
import { useListener } from "./hooks";

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
    checkMode?: FormInputCheckMode;
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
    checkMode,
    value: inputValue,
    checked: inputChecked,
    ...rest
}: FormInputProps<T, State, Error, Key, Value>) {
    const { value: currentValue, error, dirty, state, setValue, defaultValue } = useListener(form, name);
    let [inValue, inChecked] = useMemo(() => {
        if (checkMode !== undefined && checkMode !== "normal") {
            return [undefined, !!currentValue !== !!inputChecked];
        }

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
                if (inputValue !== undefined) {
                    inChecked = currentValue === inputValue;
                    inValue = inputValue + "";
                } else {
                    console.warn("Radio groups should have a value set");
                }
                break;
            }
            case "checkbox": {
                if (inputValue !== undefined) {
                    inChecked = (Array.isArray(currentValue) ? currentValue : []).includes(inputValue as never);
                    inValue = inputValue + "";
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

                if (checkMode !== undefined && checkMode !== "normal") {
                    if (rest.type !== "checkbox" && rest.type !== "radio") console.error("checkMode is only valid for radio and checkbox input types.");
                    if (checkMode !== "setNull" && checkMode !== "setUndefined") return console.error(`Invalid checkMode ${checkMode} for field ${name}.`);
                    let uncheckValue = checkMode === "setNull" ? null : undefined;
                    setValue(newChecked !== !!inputChecked ? defaultValue : (uncheckValue as any));
                    return;
                }

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
                        if (inputValue !== undefined) {
                            // Enum field
                            if (newChecked) {
                                if (checkMode === "normal") {
                                    setValue(inputValue as any);
                                }
                            }
                        } else {
                            console.warn("Radio input should have a value set when checkMode = normal");
                        }
                        return;
                    }
                    case "checkbox": {
                        if (inputValue !== undefined) {
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
