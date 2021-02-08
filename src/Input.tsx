import React from "react";
import { InputHTMLAttributes } from "react";
import { DefaultState, FormState } from "./form";
import { useListener } from "./hooks";
import {} from "./index";

type BaldInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "form" | "value">;

export type InputProps<T, State, Error, Key extends keyof T> = BaldInputProps & {
    form: FormState<T, State, Error>;
    name: Key;
    value?: T[Key] | T[Key][keyof T[Key]];
    errorClassName?: string;
    errorStyle?: React.CSSProperties;
    dirtyClassName?: string;
    dirtyStyle?: React.CSSProperties;
    disableOnSubmitting?: boolean;
    dateAsNumber?: boolean;
    deserializer?: (value: T[Key]) => string | boolean;
    serializer?: (value: string) => T[Key];
};

// function defaultSerializer(inputType: string | undefined, inputValue: string, inputChecked: boolean) {
//     switch (inputType) {
//         case "number":
//             return inputValue ? parseFloat(inputValue + "") : null;
//         case "date":
//             return inputValue ? new Date(inputValue + "") : null;
//         case "checkbox":
//         case "radio":
//             return inputValue === "true";
//         default:
//             return inputValue as any;
//     }
// }

// function defaultDeserializer(inputType: string | undefined, value: any): string | boolean {
//     switch (inputType) {
//         case "date":
//             return value?.toISOString().split("T")[0] ?? "";
//         default:
//             return (value ?? "") + "";
//     }
// }

function defaultDeserializer(inputType: string | undefined, currentValue: any, inputValue: any): [string | undefined, boolean | undefined] {
    let inValue = undefined;
    let inChecked = undefined;
    if (inputType === "number") {
        inValue = (currentValue ?? "") + "";
    } else if (inputType === "date") {
        let d = new Date(currentValue as any);
        inValue = d?.toISOString().split("T")[0] ?? "";
    } else if (inputType === "radio") {
        if (inputValue !== undefined) {
            inChecked = currentValue === inputValue;
            inValue = inputValue + "";
        } else {
            console.warn("Radio groups should have a value set");
        }
    } else if (inputType === "checkbox") {
        if (inputValue !== undefined) {
            inChecked = (Array.isArray(currentValue) ? currentValue : []).includes(inputValue as never);
            inValue = inputValue + "";
        } else {
            inChecked = !!currentValue;
        }
    } else {
        inValue = (currentValue ?? "") + "";
    }
    return [inValue, inChecked];
}

function defaultSerializer(inputType: string | undefined, newValue: string, newChecked: boolean, currentValue: any, inputValue: any, dateAsNumber: boolean): any {
    if (inputType === "number") {
        return parseFloat(newValue);
    } else if (inputType === "date") {
        if (newValue) {
            let d = new Date(newValue);
            return dateAsNumber ? d.getTime() : d;
        } else {
            return null;
        }
    } else if (inputType === "radio") {
        if (inputValue !== undefined) {
            // Enum field
            if (newChecked) return inputValue;
        } else {
            console.warn("Radio groups should have a value set");
        }
    } else if (inputType === "checkbox") {
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
    } else {
        // String field
        return newValue;
    }
}

export function Input<T, State extends DefaultState, Error, Key extends keyof T>({
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
}: InputProps<T, State, Error, Key>) {
    const { value, error, dirty, state, setValue } = useListener(form, name);

    let cl = [];
    if (className) cl.push(className);
    if (dirty) cl.push(dirtyClassName ?? "is-dirty");
    if (error) cl.push(errorClassName ?? "is-error");

    let [inValue, inChecked] = defaultDeserializer(rest.type, value, inputValue);

    return (
        <input
            style={{
                ...style,
                ...(dirty && dirtyStyle),
                ...(error && errorStyle)
            }}
            className={cl.join(" ")}
            disabled={(disableOnSubmitting ?? true) && state.isSubmitting}
            value={inValue}
            checked={inChecked}
            onChange={(ev) => {
                let v = defaultSerializer(rest.type, ev.target.value, ev.target.checked, value, inputValue, dateAsNumber ?? false);
                if (v !== undefined) setValue(v);
            }}
            name={name + ""}
            {...rest}
        />
    );
}
