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

export type Deserializer<T> = (inputValue: string, inputChecked: boolean, currentValue: T, props: SerializeProps<T>) => T;

export type SerializeProps<V = any> = {
    dateAsNumber?: boolean;
    setUndefinedOnUncheck?: boolean;
    setNullOnUncheck?: boolean;
    type?: SerializeType;
    value?: V;
};

export function defaultSerializer<T>(currentValue: T, props: SerializeProps<T>): boolean | string {
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

export function defaultDeserializer<T>(inputValue: string, inputChecked: boolean, currentValue: T, props: SerializeProps<T>) {
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
                if (inputChecked) arr.push(props.value);
                else arr.splice(arr.indexOf(props.value), 1);
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
