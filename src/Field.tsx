import { FormState } from "./form";
import React from "react";
import { useListener } from "./hooks";

export type ElementProps<C extends React.FunctionComponent<any> | keyof JSX.IntrinsicElements> = C extends React.FunctionComponent<infer P>
    ? P
    : C extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[C]
    : never;

export type FieldProps<T extends object, K extends keyof T, C> = {
    /**
     * The form to make a field for
     */
    form: FormState<T>;
    /**
     * The name of the field in form
     */
    name: K;
    /**
     * The element to create, this can be a string specifying "input", "select", "textarea" or a custom component. Is "input" by default. The props of the passed custom component are available on this field.
     *
     * **Examples**
     *
     * `<Field as="textarea" rows={10} />`
     *
     * `<Field as={CustomInput} {...} />`
     */
    as?: C;
    /**
     * Wheter to hide this field if is set to undefined or null.
     */
    hideWhenNull?: boolean;
    /**
     * A serializer is a function that converts the field value to a string/boolean value that can be passed to input. Leave undefined to use the default serializer.
     *
     * You can change the behaviour of the default serializer using the `type` prop.
     */
    serializer?: Serializer<T[K]>;
    /**
     * A deserializer is a function that converts the string/boolean input value to the real form value. Leave undefined to use the default deserializer.
     *
     * You can change the behaviour of the default deserializer using the `type` prop.
     */
    deserializer?: Deserializer<T[K]>;
    /**
     * The class to set when there is an error on this field.
     */
    errorClassName?: string;
    /**
     * The class to set when this field has been modified.
     */
    dirtyClassName?: string;
    /**
     * The style to set when where is an error on this field.
     */
    errorStyle?: React.CSSProperties;
    /**
     * The style to set when this field has been modified.
     */
    dirtyStyle?: React.CSSProperties;
    /**
     * The ref to pass to your input component.
     */
    innerRef?: React.Ref<any>;
};

// Note on innerRef: React.forwardRef breaks type-checking

export function Field<T extends object, K extends keyof T, C extends React.FunctionComponent<any> | keyof JSX.IntrinsicElements = "input">(
    props: FieldProps<T, K, C> &
        Omit<ElementProps<C>, "value" | "checked" | "onChange" | "field" | "ref" | keyof FieldProps<T, K, C> | keyof SerializeProps> &
        SerializeProps<T[K]>
) {
    const {
        form,
        as = "input",
        serializer,
        dateAsNumber,
        setNullOnUncheck,
        setUndefinedOnUncheck,
        deserializer,
        hideWhenNull,
        disabled,
        className,
        style,
        errorClassName,
        errorStyle,
        dirtyClassName,
        dirtyStyle,
        innerRef,
        ...rest
    } = props;
    const serializeProps = {
        dateAsNumber,
        setNullOnUncheck,
        setUndefinedOnUncheck,
        type: props.type,
        value: props.value
    };
    const field = useListener(form, props.name);
    if (hideWhenNull && (field.value === undefined || field.value === null)) return null;
    let v = (serializer ?? defaultSerializer)(field.value, serializeProps);
    return React.createElement(as, {
        ...rest,
        ref: innerRef,
        checked: typeof v === "boolean" ? v : undefined,
        value: typeof v === "boolean" ? undefined : v,
        disabled: field.state.isSubmitting || disabled,
        className: (field.dirty ? "field-dirty " : "") + (field.error ? "field-error " : "") + (className || ""),
        style: { ...style, ...(field.dirty ? dirtyStyle : {}), ...(field.error ? errorStyle : {}) },
        field,
        onChange: (ev: any) => {
            let v =
                typeof ev === "object" && "target" in ev
                    ? props.type === "checkbox" || props.type === "radio"
                        ? ev.target.checked
                        : ev.target.value
                    : ev;
            if (typeof v === "string" || typeof v === "boolean")
                field.setValue((deserializer ?? defaultDeserializer)(v, field.value, serializeProps));
            else field.setValue(v);
        }
    });
}

export type SerializeType =
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

export type Serializer<T> = (currentValue: T, props: SerializeProps<T>) => boolean | string;
export type Deserializer<T> = (inputValue: string | boolean, currentValue: T, props: SerializeProps<T>) => T;

export type SerializeProps<V = any> = {
    dateAsNumber?: boolean;
    setUndefinedOnUncheck?: boolean;
    setNullOnUncheck?: boolean;
    type?: SerializeType;
    value?: V extends any[] ? V[number] : V;
};

export function defaultSerializer<T>(currentValue: T, props: SerializeProps<T>): boolean | string {
    switch (props.type) {
        case "datetime-local":
        case "date": {
            let dateValue = currentValue as any;
            if (dateValue === null || dateValue === undefined || dateValue === "") {
                return "";
            }
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

export function defaultDeserializer<T>(inputValue: string | boolean, currentValue: T, props: SerializeProps<T>) {
    switch (props.type) {
        case "number": {
            return parseFloat(inputValue as any);
        }
        case "datetime-local":
        case "date": {
            if (inputValue) {
                let d = new Date(inputValue as any);
                return props.dateAsNumber ? d.getTime() : d;
            } else {
                return null;
            }
        }
        case "radio": {
            // Enum field
            if (inputValue) {
                return props.value;
            }
            return currentValue;
        }
        case "checkbox": {
            if (props.setNullOnUncheck || props.setUndefinedOnUncheck) {
                if (inputValue && props.value === undefined && process.env.NODE_ENV === "development") {
                    console.error(
                        "Checkbox using setNullOnUncheck got checked but a value to set was not found, please provide a value to the value prop."
                    );
                }
                return inputValue ? props.value : ((props.setNullOnUncheck ? null : undefined) as any);
            } else if (props.value !== undefined) {
                // Primitive array field
                let arr = Array.isArray(currentValue) ? [...currentValue] : [];
                if (inputValue) arr.push(props.value);
                else arr.splice(arr.indexOf(props.value), 1);
                return arr as any;
            } else {
                // Boolean field
                return inputValue;
            }
        }
        default: {
            // String field
            return inputValue as any;
        }
    }
}
