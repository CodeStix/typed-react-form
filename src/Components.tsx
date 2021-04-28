import React from "react";
import { ChildFormState, DefaultError, DefaultState, FieldsOfType, FormState, KeysOfType } from "./form";
import { useArrayField, useListener, useAnyListener, useObjectField, useTruthyListener, FormField } from "./hooks";

/**
 * Wrapper around useArrayField (which is a wrapper around useObjectField).
 * Exports useful functions to manipulate arrays.
 * This hook does cause a rerender, but only if the whole array becomes null/undefined.
 * @param parent The parent form.
 * @param name The parent's field to create a child form for.
 */
export function ArrayField<
    T extends FieldsOfType<any, any[]>,
    K extends KeysOfType<T, any[] | object>,
    State = DefaultState,
    Error extends string = DefaultError
>(props: {
    form: FormState<T, State, Error>;
    name: K;
    render: (props: {
        form: ChildFormState<T, K, State, Error>;
        remove: (index: number) => void;
        clear: () => void;
        move: (index: number, newIndex: number) => void;
        swap: (index: number, newIndex: number) => void;
        append: (value: NonNullable<T[K]>[any]) => void;
        values: NonNullable<T[K]>;
        setValues: (values: NonNullable<T[K]>) => void;
    }) => React.ReactNode;
}) {
    const childForm = useArrayField(props.form, props.name);

    // Causes a rerender when the array becomes null/not null
    useTruthyListener(props.form, props.name);

    // Do not render anything if the parent field is falsly
    if (!props.form.values[props.name]) return null;
    return <React.Fragment>{props.render(childForm)}</React.Fragment>;
}

/**
 * Wrapper around useListener
 * Renders using the provided render function each time the provided field changes. When no render function is provided, the current field value will be rendered as a string.
 * @param form The form to listen on.
 * @param name The form's field to listen to.
 */
export function Listener<
    T extends object,
    K extends keyof T,
    State extends DefaultState = DefaultState,
    Error extends DefaultError = DefaultError
>(props: { form: FormState<T, State, Error>; name: K; render?: (props: FormField<T, K, State, Error>) => React.ReactNode }) {
    const l = useListener(props.form, props.name);
    return <React.Fragment>{props.render?.(l) ?? String(l.value)}</React.Fragment>;
}

/**
 * Wrapper around useAnyListener.
 * Renders using the provided render function each time something in the form changes. When no render function is provided, a JSON representation of the form values is displayed.
 * @param form The form that was passed in.
 */
export function AnyListener<T extends object, State = DefaultState, Error extends DefaultError = DefaultError>(props: {
    form: FormState<T, State, Error>;
    render?: (props: FormState<T, State, Error>) => React.ReactNode;
}) {
    const l = useAnyListener(props.form);
    return <React.Fragment>{props.render?.(l) ?? JSON.stringify(l.values, null, 2)}</React.Fragment>;
}

/**
 * Wrapper around useObjectField
 * Creates a child form for another root or child form. You must use this for object and array (see useArrayField) fields.
 * This hook does cause a rerender, but only if the object field becomes null/undefined.
 * @param parentForm The parent form.
 * @param name The parent's field to create a child form for.
 */
export function ObjectField<
    T extends FieldsOfType<any, object>,
    K extends KeysOfType<T, object>,
    ParentState = DefaultState,
    ParentError extends DefaultError = DefaultError
>(props: {
    form: FormState<T, ParentState, ParentError>; // Use the parent prop instead of the form prop when using ObjectField.
    name: K;
    render: (props: ChildFormState<T, K, ParentState, ParentError>) => React.ReactNode;
}) {
    const childForm = useObjectField(props.form, props.name);
    // Causes a rerender when the object value becomes null/undefined
    useTruthyListener(props.form, props.name);

    // Do not render anything if the parent field is falsly
    if (!props.form.values[props.name]) return null;
    return <React.Fragment>{props.render(childForm)}</React.Fragment>;
}
