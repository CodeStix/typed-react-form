import React from "react";
import { InputHTMLAttributes } from "react";
import { DefaultState, FormState } from "./form";
import { useListener } from "./hooks";

type BaldInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "form" | "value">;

export const DEFAULT_DIRTY_CLASS = "typed-form-dirty";
export const DEFAULT_ERROR_CLASS = "typed-form-error";

export function getClassName(...args: any) {
    return [...args].filter((e) => !!e).join(" ");
}

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
    deserializer?: (value: T[Key], inputValue: Value | undefined) => string | undefined;
    serializer?: (newValue: string, newChecked: boolean, currentValue: T[Key], inputValue: Value | undefined) => T[Key];
};

function defaultDeserializer(inputType: string | undefined, currentValue: any, inputValue: any): [string | undefined, boolean | undefined] {
    let inValue = undefined;
    let inChecked = undefined;
    switch (inputType) {
        case "number": {
            inValue = (currentValue ?? "") + "";
            break;
        }
        case "date": {
            let n = currentValue;
            if (typeof n === "string") {
                let ni = parseInt(currentValue);
                if (!isNaN(ni)) n = ni;
            }
            let d = new Date(n as any);
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
}

function defaultSerializer(inputType: string | undefined, newValue: string, newChecked: boolean, currentValue: any, inputValue: any, dateAsNumber: boolean): any {
    switch (inputType) {
        case "number":
            return parseFloat(newValue);
        case "date": {
            if (newValue) {
                let d = new Date(newValue);
                return dateAsNumber ? d.getTime() : d;
            } else {
                return null;
            }
        }
        case "radio": {
            if (inputValue !== undefined) {
                // Enum field
                if (newChecked) return inputValue;
            } else {
                console.warn("Radio groups should have a value set");
                return null;
            }
        }
        case "checkbox": {
            if (inputValue !== undefined) {
                // Primitive array field
                let arr = Array.isArray(currentValue) ? [...currentValue] : [];
                if (newChecked) arr.push(inputValue);
                else arr.splice(arr.indexOf(inputValue), 1);
                return arr;
            } else {
                // Boolean field
                return newChecked;
            }
        }
        default: {
            // String field
            return newValue;
        }
    }
}

export function FormInput<T, State extends DefaultState, Error, Key extends keyof T, Value extends T[Key] | T[Key][keyof T[Key]]>({
    form,
    name,
    deserializer,
    serializer,
    style,
    className,
    disableOnSubmitting,
    dateAsNumber,
    errorClassName,
    errorStyle,
    dirtyClassName,
    dirtyStyle,
    value: inputValue,
    ...rest
}: FormInputProps<T, State, Error, Key, Value>) {
    const { value, error, dirty, state, setValue } = useListener(form, name);
    let [inValue, inChecked] = deserializer ? [deserializer(value, inputValue), undefined] : defaultDeserializer(rest.type, value, inputValue);
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
                let v = serializer
                    ? serializer(ev.target.value, ev.target.checked, value, inputValue)
                    : defaultSerializer(rest.type, ev.target.value, ev.target.checked, value, inputValue, dateAsNumber ?? false);
                if (v !== undefined) setValue(v);
            }}
            name={name + ""}
            {...rest}
        />
    );
}
