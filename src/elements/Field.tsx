import { FormState } from "../form";
import React, { useCallback } from "react";
import { useListener } from "../hooks";

export type ElementProps<C extends React.FunctionComponent<any> | keyof JSX.IntrinsicElements> = C extends React.FunctionComponent<infer P>
    ? P
    : C extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[C]
    : never;

export function Field<T extends object, K extends keyof T, C extends React.FunctionComponent<any> | keyof JSX.IntrinsicElements>(
    props: {
        form: FormState<T>;
        name: K;
        component?: C;
    } & Omit<ElementProps<C>, "form" | "name" | "component" | "value" | "onChange">
) {
    const { form, component = "input", ...rest } = props;
    const { value, setValue } = useListener(form, props.name);
    const onChange = useCallback((ev: any) => setValue(ev.target?.value ?? ev), [setValue]);
    return React.createElement(component, { ...rest, value, onChange });
}
