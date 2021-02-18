import React, { useEffect, useRef, useState } from "react";
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
    const childForm = useArrayForm(props.form, props.name);
    const oldThruthly = useRef(!!props.form.values[props.name]);
    const [, setRender] = useState(0);

    // Rerender when array became null/not null (thruthly/falsely)
    useEffect(() => {
        let id = props.form.listen(props.name, () => {
            let thruthly = !!props.form.values[props.name];
            if (thruthly !== oldThruthly.current) {
                setRender((i) => i + 1);
                oldThruthly.current = thruthly;
            }
        });
        return () => props.form.ignore(props.name, id);
    }, []);

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
export function Listener<T, State, Error, Key extends keyof T>(props: {
    form: FormState<T, State, Error>;
    name: Key;
    render?: (props: {
        value: T[Key];
        defaultValue: T[Key];
        setValue: (value: T[Key]) => void;
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
 */
export function AnyListener<T, State, Error>(props: {
    form: FormState<T, State, Error>;
    render?: (props: FormState<T, State, Error>) => React.ReactNode;
}) {
    const l = useAnyListener(props.form);
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
    const oldThruthly = useRef(!!props.form.values[props.name]);
    const [, setRender] = useState(0);

    // Only rerender when object became null/not null (thruthly/falsely)
    useEffect(() => {
        let id = props.form.listen(props.name, () => {
            let thruthly = !!props.form.values[props.name];
            if (thruthly !== oldThruthly.current) {
                setRender((i) => i + 1);
                oldThruthly.current = thruthly;
            }
        });
        return () => props.form.ignore(props.name, id);
    }, []);

    // Do not render anything if the parent field is falsly
    if (!props.form.values[props.name]) return null;
    return <React.Fragment>{props.render?.(childForm)}</React.Fragment>;
}
