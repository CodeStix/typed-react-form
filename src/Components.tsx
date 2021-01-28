import React from "react";
import { DirtyMap, ErrorMap, FormState } from "./form";
import {
    useArrayForm,
    useListener,
    useAnyListener,
    useChildForm
} from "./hooks";

export function ArrayForm<
    Parent,
    ParentState,
    ParentError,
    Key extends keyof Parent
>(props: {
    parent: FormState<Parent, ParentState, ParentError>;
    name: Key;
    children: (props: {
        form: FormState<Parent[Key], ParentState, ParentError>;
        remove: (index: number) => void;
        clear: () => void;
        move: (index: number, newIndex: number) => void;
        swap: (index: number, newIndex: number) => void;
        append: (value: Parent[Key][keyof Parent[Key]]) => void;
        values: Parent[Key];
        setValues: (values: Parent[Key]) => void;
    }) => React.ReactNode;
}) {
    const arr = useArrayForm(props.parent, props.name);
    return <React.Fragment>{props.children(arr)}</React.Fragment>;
}

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

export function AnyListener<T, State, Error>(props: {
    form: FormState<T, State, Error>;
    children: (props: FormState<T, State, Error>) => React.ReactNode;
}) {
    const l = useAnyListener(props.form);
    return <React.Fragment>{props.children(l)}</React.Fragment>;
}

export function ChildForm<
    Parent,
    ParentState,
    ParentError,
    Key extends keyof Parent
>(props: {
    parent: FormState<Parent, ParentState, ParentError>;
    name: Key;
    children: (
        props: FormState<Parent[Key], ParentState, ParentError>
    ) => React.ReactNode;
}) {
    const arr = useChildForm(props.parent, props.name);
    return <React.Fragment>{props.children(arr)}</React.Fragment>;
}
