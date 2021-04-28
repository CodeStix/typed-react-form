import React from "react";
import { ChildFormState, DefaultError, DefaultState, DirtyMap, ErrorMap, FieldsOfType, FormState, KeysOfType } from "./form";
import { useArrayField, useListener, useAnyListener, useObjectField, useTruthyListener } from "./hooks";

/**
 * Wrapper around useArrayForm (which is a wrapper around useObjectField).
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
    render?: (props: {
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
    return <React.Fragment>{props.render?.(childForm) ?? childForm.values + ""}</React.Fragment>;
}

/**
 * Wrapper around useListener
 * Listen for changes on a form's field. Behaves like useState.
 * You shouldn't use this hook in large components, as it rerenders each time something changes. Use the wrapper <Listener /> instead.
 * @param form The form to listen on.
 * @param name The form's field to listen to.
 */
export function Listener<T extends object, K extends keyof T, State = DefaultState, Error extends string = DefaultError>(props: {
    form: FormState<T, State, Error>;
    name: K;
    render?: (props: {
        value: T[K];
        defaultValue: T[K];
        setValue: (value: T[K]) => void;
        dirty: DirtyMap<T>[K];
        error: ErrorMap<T, Error>[K];
        state: State;
        form: FormState<T, State, Error>;
    }) => React.ReactNode;
}) {
    const l = useListener(props.form, props.name);
    return <React.Fragment>{props.render?.(l) ?? l.value + ""}</React.Fragment>;
}

/**
 * Wrapper around useAnyListener.
 * Listens for any change on this form. Behaves like useState.
 * You shouldn't use this hook in large components, as it rerenders each time something changes. Use the wrapper <AnyListener /> instead.
 * @param form The form that was passed in.
 */
export function AnyListener<T extends object, State = DefaultState, Error extends string = DefaultError>(props: {
    form: FormState<T, State, Error>;
    render?: (props: FormState<T, State, Error>) => React.ReactNode;
}) {
    const l = useAnyListener(props.form);
    return <React.Fragment>{props.render?.(l) ?? l.values + ""}</React.Fragment>;
}

/**
 * Wrapper around useObjectField
 * Creates a child form for another root or child form. You must use this for object and array (see useArrayForm) fields.
 * This hook does cause a rerender, but only if the object field becomes null/undefined.
 * @param parentForm The parent form.
 * @param name The parent's field to create a child form for.
 */
export function ObjectField<
    T extends FieldsOfType<any, object>,
    K extends KeysOfType<T, object>,
    ParentState = DefaultState,
    ParentError extends string = DefaultError
>(props: {
    form: FormState<T, ParentState, ParentError>; // Use the parent prop instead of the form prop when using ChildForm.
    name: K;
    render?: (props: ChildFormState<T, K, ParentState, ParentError>) => React.ReactNode;
}) {
    const childForm = useObjectField(props.form, props.name);
    // Causes a rerender when the object value becomes null/undefined
    useTruthyListener(props.form, props.name);

    // Do not render anything if the parent field is falsly
    if (!props.form.values[props.name]) return null;
    return <React.Fragment>{props.render?.(childForm)}</React.Fragment>;
}
