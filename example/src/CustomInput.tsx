import React, { InputHTMLAttributes } from "react";
import { FormState, useListener } from "typed-react-form";
import { VisualRender } from "./VisualRender";

/**
 * A custom input that can be reused everywhere when using useForm
 */
export function CustomInput<T extends object>({
    form,
    name,
    ...rest
}: {
    form: FormState<T, { isSubmitting: boolean }>;
    name: keyof T;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "form">) {
    const { value, dirty, defaultValue, error, state } = useListener(form, name);

    return (
        <VisualRender>
            <input
                disabled={state.isSubmitting}
                placeholder={defaultValue as any}
                style={{
                    background: dirty ? "#eee" : "#fff",
                    padding: "0.3em",
                    border: "1px solid #0005",
                    borderRadius: "0.5em",
                    fontSize: "inherit",
                    color: error ? "#e11" : "initial"
                }}
                value={value as any}
                onChange={(ev) => form.setValue(name, ev.target.value as any)}
                {...rest}
            />
            {error && (
                <span
                    style={{
                        padding: "0.3em",
                        fontWeight: "bold",
                        color: "red"
                    }}
                >
                    {error}
                </span>
            )}
        </VisualRender>
    );
}
