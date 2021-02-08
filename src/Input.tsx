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

    let inChecked = undefined;
    let inValue = undefined;
    if (rest.type === "number") {
        inValue = (value ?? "") + "";
    } else if (rest.type === "date") {
        let d = new Date(value as any);
        inValue = d?.toISOString().split("T")[0] ?? "";
    } else if (rest.type === "radio") {
        if (inputValue !== undefined) {
            inChecked = value === inputValue;
            inValue = inputValue + "";
        } else {
            console.warn("Radio groups should have a value set");
        }
    } else if (rest.type === "checkbox") {
        if (inputValue !== undefined) {
            inChecked = (Array.isArray(value) ? value : []).includes(inputValue as never);
            inValue = inputValue + "";
        } else {
            inChecked = !!value;
        }
    } else {
        inValue = (value ?? "") + "";
    }

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
                let v = ev.target.value;
                let c = ev.target.checked;

                if (rest.type === "number") {
                    setValue(parseFloat(v) as any);
                } else if (rest.type === "date") {
                    if (v) {
                        let d = new Date(v);
                        setValue((dateAsNumber ? d.getTime() : d) as any);
                    } else {
                        setValue(null as any);
                    }
                } else if (rest.type === "radio") {
                    if (inputValue !== undefined) {
                        // Enum field
                        if (c) setValue(inputValue as any);
                    } else {
                        console.warn("Radio groups should have a value set");
                    }
                } else if (rest.type === "checkbox") {
                    if (inputValue !== undefined) {
                        // Primitive array field
                        let arr = Array.isArray(value) ? [...value] : [];
                        if (c) arr.push(inputValue);
                        else arr.splice(arr.indexOf(inputValue), 1);
                        setValue(arr as any);
                    } else {
                        // Boolean field
                        setValue(c as any);
                    }
                } else {
                    // String field
                    setValue(v as any);
                }
            }}
            name={name + ""}
            {...rest}
        />
    );
}
