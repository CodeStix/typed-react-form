import React from "react";
import { ChildFormState, DirtyMap, ErrorMap, FormState } from "./form";
import { useArrayListener, useListener, useAnyListener, useChildForm } from "./hooks";

/**
 * Wrapper around useArrayListener (which is a wrapper around useChildForm).
 * Exports useful functions to manipulate arrays.
 * This hook does cause a rerender, but only if the whole array changes.
 * @param parent The parent form.
 * @param name The parent's field to create a child form for.
 */
export function ArrayListener<Parent, ParentState, ParentError, Key extends keyof Parent>(props: {
    parent: FormState<Parent, ParentState, ParentError>;
    name: Key;
    children: (props: {
        form: ChildFormState<Parent, ParentState, ParentError, Key>;
        remove: (index: number) => void;
        clear: () => void;
        move: (index: number, newIndex: number) => void;
        swap: (index: number, newIndex: number) => void;
        append: (value: Parent[Key][keyof Parent[Key]]) => void;
        values: NonNullable<Parent[Key]>;
        setValues: (values: NonNullable<Parent[Key]>) => void;
    }) => React.ReactNode;
}) {
    const arr = useArrayListener(props.parent, props.name);
    return <React.Fragment>{props.children(arr)}</React.Fragment>;
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
    children: (props: {
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
    return <React.Fragment>{props.children(l)}</React.Fragment>;
}

/**
 * Wrapper around useAnyListener.
 * Listens for any change on this form. Behaves like useState.
 * You shouldn't use this hook in large components, as it rerenders each time something changes. Use the wrapper <AnyListener /> instead.
 * @param form The form to listen to.
 * @param onlyOnSetValues True if you only want to listen for changes that are set using setValues. (used for arrays)
 */
export function AnyListener<T, State, Error>(props: { form: FormState<T, State, Error>; onlyOnSetValues?: boolean; children: (props: FormState<T, State, Error>) => React.ReactNode }) {
    const l = useAnyListener(props.form, props.onlyOnSetValues);
    return <React.Fragment>{props.children(l)}</React.Fragment>;
}

/**
 * Wrapper around useChildForm
 * Creates a nested form for another root or nested form. You must use this for object and array (see useArrayListener) field.
 * This hook doesn't cause a rerender.
 * @param parentForm The parent form.
 * @param name The parent's field to create a child form for.
 */
export function ChildForm<Parent, ParentState, ParentError, Key extends keyof Parent>(props: {
    parent: FormState<Parent, ParentState, ParentError>;
    name: Key;
    children: (props: ChildFormState<Parent, ParentState, ParentError, Key>) => React.ReactNode;
}) {
    const arr = useChildForm(props.parent, props.name);
    return <React.Fragment>{props.children(arr)}</React.Fragment>;
}
