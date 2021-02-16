import React from "react";
import { ChildFormState, DirtyMap, ErrorMap, FormState } from "./form";
import { useArrayForm, useListener, useAnyListener, useChildForm } from "./hooks";

/**
 * Wrapper around useArrayForm (which is a wrapper around useChildForm).
 * Exports useful functions to manipulate arrays.
 * This hook does cause a rerender, but only if the whole array changes.
 * @param parent The parent form.
 * @param name The parent's field to create a child form for.
 */
export function ArrayForm<Parent, ParentState, ParentError, Key extends keyof Parent>(props: {
    form: FormState<Parent, ParentState, ParentError>;
    name: Key;
    render?: (props: {
        form: ChildFormState<Parent, ParentState, ParentError, Key>;
        remove: (index: number) => void;
        clear: () => void;
        move: (index: number, newIndex: number) => void;
        swap: (index: number, newIndex: number) => void;
        append: (value: NonNullable<Parent[Key]>[keyof NonNullable<Parent[Key]>]) => void;
        values: NonNullable<Parent[Key]>;
        setValues: (values: NonNullable<Parent[Key]>) => void;
    }) => React.ReactNode;
}) {
    const arr = useArrayForm(props.form, props.name);
    return <React.Fragment>{props.render?.(arr) ?? arr.values + ""}</React.Fragment>;
}

/**
 * Wrapper around useListener
 * Listen for changes on a form's field. Behaves like useState.
 * You shouldn't use this hook in large components, as it rerenders each time something changes. Use the wrapper <Listener /> instead.
 * @param form The form to listen on.
 * @param name The form's field to listen to.
 */
export function Listener<T, State, Error, Key extends keyof T>(props: {
    form: FormState<T, State, Error>;
    name: Key;
    render?: (props: {
        value: T[Key];
        defaultValue: T[Key];
        setValue: (value: T[Key]) => boolean;
        dirty: DirtyMap<T>[Key];
        error: ErrorMap<T, Error>[Key];
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
 * @param form The form to listen to.
 * @param onlyOnSetValues True if you only want to listen for changes that are set using setValues. (used for arrays)
 */
export function AnyListener<T, State, Error>(props: { form: FormState<T, State, Error>; onlyOnSetValues?: boolean; render?: (props: FormState<T, State, Error>) => React.ReactNode }) {
    const l = useAnyListener(props.form, props.onlyOnSetValues);
    return <React.Fragment>{props.render?.(l) ?? l.values + ""}</React.Fragment>;
}

/**
 * Wrapper around useChildForm
 * Creates a child form for another root or child form. You must use this for object and array (see useArrayForm) fields.
 * This hook doesn't cause a rerender.
 * @param parentForm The parent form.
 * @param name The parent's field to create a child form for.
 */
export function ChildForm<Parent, ParentState, ParentError, Key extends keyof Parent>(props: {
    form: FormState<Parent, ParentState, ParentError>; // Use the parent prop instead of the form prop when using ChildForm.
    name: Key;
    render?: (props: ChildFormState<Parent, ParentState, ParentError, Key>) => React.ReactNode;
}) {
    const childForm = useChildForm(props.form, props.name);
    let form = useAnyListener(childForm, true);
    if (form.empty) return null;
    return <React.Fragment>{props.render?.(childForm)}</React.Fragment>;
}
