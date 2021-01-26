import React, { useEffect, useRef, useState } from "react";

export type ObjectOrArray = {
    [Key in number | string]: any;
};

export type KeyOf<T extends ObjectOrArray> = T extends any[] ? number : keyof T;

export type ListenerCallback = (updateAllWasUsed: boolean) => void;
export type ListenerMap = { [T in string]?: ListenerCallback };

type DirtyType<T> = T extends ObjectOrArray ? DirtyMap<T> | false : boolean;
type DirtyMap<T extends ObjectOrArray> = {
    [Key in KeyOf<T>]?: DirtyType<T[Key]>;
};

type ErrorType<T, Error> = T extends ObjectOrArray ? ErrorMap<T, Error> : Error;
type ErrorMap<T extends ObjectOrArray, Error> = {
    [Key in KeyOf<T>]?: ErrorType<T[Key], Error>;
};

export type Validator<T, Error> = (values: T) => ErrorMap<T, Error>;

function keys<T>(obj: T): KeyOf<T>[] {
    if (Array.isArray(obj)) {
        return Array.from(Array(obj.length).keys()) as any;
    } else if (typeof obj === "object") {
        return Object.keys(obj) as any;
    } else {
        throw new Error("Can only keys() arrays and objects.");
    }
}

function memberCopy<T>(value: T): T {
    if (Array.isArray(value)) {
        return [...value] as any;
    } else if (typeof value === "object") {
        return { ...value };
    } else {
        throw new Error("Can only memberCopy() arrays and objects.");
    }
}

function changedKeys<T>(
    a: T,
    b: T,
    objectCompareMode: "skip" | "truthy" | "compare" = "truthy"
): KeyOf<T>[] {
    if (a === b) return [];
    let aKeys = keys(a);
    let bKeys = keys(b);
    let largest = aKeys.length > bKeys.length ? aKeys : bKeys;
    let changed = [];
    const o = {};
    for (let i = 0; i < largest.length; i++) {
        let k = largest[i];
        let av = a[k as any];
        let bv = b[k as any];
        if (typeof av === "object" || typeof bv === "object") {
            if (objectCompareMode === "truthy") {
                if (typeof av === "object") av = av ? o : undefined;
                if (typeof bv === "object") bv = bv ? o : undefined;
            } else if (objectCompareMode === "skip") {
                continue;
            }
        }
        if (av !== bv) {
            changed.push(k);
        }
    }
    return changed;
}

export class Listener<Key extends string | number | symbol> {
    private listeners?: { [T in Key]?: ListenerMap };
    private anyListeners?: ListenerMap;
    private counter = 0;

    /**
     * Invokes a callback when a specified field changes.
     * @param key The field to listen to.
     * @param listener The callback to invoke when the field changes.
     * @returns An id to pass to `ignore()` when you don't want to listen to the field anymore.
     */
    public listen(key: Key, listener: ListenerCallback): string {
        if (!this.listeners) this.listeners = {};
        let setters = this.listeners[key];
        if (!setters) {
            setters = {};
            this.listeners[key] = setters;
        }
        let id = "" + this.counter++;
        setters[id] = listener;
        return id;
    }

    /**
     * Invokes a callback when any field on this form has changed.
     * @param listener The callback to invoke.
     */
    public listenAny(listener: ListenerCallback) {
        if (!this.anyListeners) this.anyListeners = {};
        let id = "" + this.counter++;
        this.anyListeners[id] = listener;
        return id;
    }

    public ignoreAny(id: string) {
        if (!this.anyListeners) return;
        delete this.anyListeners[id];
    }

    public ignore(key: Key, id: string) {
        if (!this.listeners) return;
        let setters = this.listeners[key];
        if (!setters) {
            console.warn("Ignore was called for no reason", key, id);
            return;
        }
        delete setters[id];
    }

    public fireMultiple(key: Key[], updateAllWasUsed: boolean = false) {
        key.forEach((e) => this.fire(e, updateAllWasUsed));
    }

    public fire(key: Key, updateAllWasUsed: boolean = false) {
        if (this.listeners) {
            let l = this.listeners[key];
            if (l) {
                Object.keys(l!).forEach((e) => l![e]!(updateAllWasUsed));
            }
        }
        if (this.anyListeners) {
            Object.keys(this.anyListeners).forEach((e) =>
                this.anyListeners![e]!(updateAllWasUsed)
            );
        }
    }
}

export class ObjectListener<T extends ObjectOrArray> extends Listener<
    KeyOf<T>
> {
    private _values: T;

    public get values() {
        return this._values;
    }

    public constructor(initialValues: T) {
        super();
        this._values = memberCopy(initialValues);
    }

    public update(key: KeyOf<T>, value: T[KeyOf<T>] | undefined) {
        if (
            typeof this._values[key] !== "object" &&
            this._values[key] === value
        )
            return false;
        if (value === undefined) {
            if (Array.isArray(this._values)) {
                this._values.splice(key as number, 1);
            } else {
                delete this._values[key];
            }
        } else {
            this._values[key] = value;
        }
        super.fire(key, false);
        return true;
    }

    public updateAll(values: T) {
        if (this._values === values) return false;
        let changed = changedKeys(this._values, values, "compare");
        this._values = memberCopy(values);
        super.fireMultiple(changed, true);
        return changed.length > 0;
    }
}

export class Form<
    T extends ObjectOrArray,
    State extends ObjectOrArray = {},
    Error = string
> {
    public valuesListener: ObjectListener<T>;
    public defaultValuesListener: ObjectListener<T>;
    public dirtyListener: ObjectListener<DirtyMap<T>>;
    public errorListener: ObjectListener<ErrorMap<T, Error>>;
    public stateListener: ObjectListener<State>;
    public validator?: Validator<T, Error>;
    public validateOnChange: boolean;
    public formId: number = Form.counter++;

    private static counter = 0;

    public get values() {
        return this.valuesListener.values;
    }

    public get defaultValues() {
        return this.defaultValuesListener.values;
    }

    public get dirtyMap() {
        return this.dirtyListener.values;
    }

    public get errorMap() {
        return this.errorListener.values;
    }

    public get dirty() {
        return (
            Object.keys(this.dirtyListener.values).some(
                (e) => this.dirtyListener.values[e]
            ) ||
            Object.keys(this.values).length !==
                Object.keys(this.defaultValues).length
        );
    }

    public get error() {
        return Object.keys(this.errorListener.values).some(
            (e) => this.errorListener.values[e]
        );
    }

    public get state() {
        return this.stateListener.values;
    }

    constructor(
        values: T,
        defaultValues: T,
        state: State,
        validator?: Validator<T, Error>,
        validateOnChange: boolean = true
    ) {
        this.validator = validator;
        this.validateOnChange = validateOnChange;
        this.valuesListener = new ObjectListener(values);
        this.defaultValuesListener = new ObjectListener(defaultValues);
        this.stateListener = new ObjectListener(state);
        this.dirtyListener = new ObjectListener({});
        this.errorListener = new ObjectListener({});
    }

    public setState(newState: State) {
        this.stateListener.updateAll(newState);
    }

    public setStateField<Key extends KeyOf<State>>(
        key: Key,
        value: State[Key]
    ) {
        this.stateListener.update(key, value);
    }

    public resetAll() {
        this.setValues(this.defaultValues);
    }

    public reset(key: KeyOf<T>) {
        this.setValueInternal(key, this.defaultValues[key], false as any);
    }

    public setErrors(errors: ErrorMap<T, Error>) {
        this.errorListener.updateAll(errors);
    }

    public setError<Key extends KeyOf<T>>(
        key: Key,
        error: ErrorType<T[Key], Error> | null | undefined
    ) {
        this.errorListener.update(key as any, (error as any) ?? undefined);
    }

    public validateAll() {
        if (!this.validator) {
            console.warn(
                "validateAll() was called on a form which does not have a validator set"
            );
            return;
        }
        let allErrors = this.validator(this.values);
        this.errorListener.updateAll(allErrors as any);
    }

    public validate(key: KeyOf<T>) {
        if (!this.validator) {
            console.warn(
                "validate() was called on a form which does not have a validator set"
            );
            return;
        }
        // TODO: validation per field
        let allErrors = this.validator(this.values);
        this.errorListener.update(key as any, allErrors[key] as any);
    }

    public recalculateDirty() {
        let ak = Object.keys(this.values);
        let bk = Object.keys(this.defaultValues);
        let lk = ak.length > bk.length ? ak : bk;
        let d = { ...this.dirtyListener.values };
        for (let i = 0; i < lk.length; i++) {
            let e = lk[i];
            let a = this.values[e];
            let b = this.defaultValues[e];
            if (typeof a === "object" || typeof b === "object") continue; // Do not compare objects
            if (a !== b) d[e] = true;
            else delete d[e];
        }
        this.dirtyListener.updateAll(d);
    }

    public setValues(values: T, validate: boolean = true) {
        if (!values) {
            console.warn("setValues was called with undefined");
            return;
        }
        if (this.valuesListener.updateAll(values)) {
            this.recalculateDirty();
            if (validate && this.validator) this.validateAll();
        }
    }

    public setDefaultValues(defaultValues: T, validate: boolean = true) {
        if (this.defaultValuesListener.updateAll(defaultValues)) {
            this.recalculateDirty();
            if (validate && this.validator) this.validateAll();
        }
    }

    public setValue<Key extends KeyOf<T>>(
        key: Key,
        value: T[Key],
        isDefault: boolean = false
    ) {
        if (typeof value === "object" || Array.isArray(value)) {
            console.warn(
                "Not setting value, value is object, use setValueInternal"
            );
            return;
        }
        this.setValueInternal(
            key,
            value,
            (this.defaultValuesListener.values[key] !== value) as any,
            isDefault
        );
    }

    public setValueInternal<Key extends KeyOf<T>>(
        key: Key,
        value: T[Key],
        dirty?: DirtyType<T[Key]>,
        isDefault: boolean = false
    ) {
        let changed = isDefault
            ? this.defaultValuesListener.update(key, value)
            : this.valuesListener.update(key, value);
        if (changed) {
            if (dirty !== undefined)
                this.dirtyListener.update(key as any, dirty as any);
            if (this.validator && this.validateOnChange) this.validateAll(); // use this.validate instead?
        }
    }
}

export function useForm<
    T extends ObjectOrArray,
    State extends ObjectOrArray = {},
    Error = string
>(
    defaultValues: T,
    state: State,
    validator?: Validator<T, Error>,
    validateOnChange: boolean = true
) {
    let c = useRef<Form<T, State, Error> | null>(null);

    if (c.current === null) {
        c.current = new Form<T, State, Error>(
            defaultValues,
            defaultValues,
            state,
            validator,
            validateOnChange
        );
    }

    useEffect(() => {
        c.current!.setDefaultValues(defaultValues);
    }, [defaultValues]);

    return c.current;
}

export function useListener<
    T extends ObjectOrArray,
    State extends ObjectOrArray,
    Error,
    Key extends KeyOf<T>
>(form: Form<T, State, Error>, key: Key, onlyOnUpdateAll: boolean = false) {
    const [, setRender] = useState(0);

    useEffect(() => {
        function causeRerender(updateAllWasUsed: boolean) {
            if (!onlyOnUpdateAll || updateAllWasUsed) setRender((e) => e + 1);
        }
        let a1 = form.valuesListener.listen(key, causeRerender);
        let a2 = form.defaultValuesListener.listen(key, causeRerender);
        let a3 = form.dirtyListener.listen(key as any, causeRerender);
        let a4 = form.errorListener.listen(key as any, causeRerender);
        let a5 = form.stateListener.listenAny(causeRerender);
        return () => {
            form.valuesListener.ignore(key, a1);
            form.defaultValuesListener.ignore(key, a2);
            form.dirtyListener.ignore(key as any, a3);
            form.errorListener.ignore(key as any, a4);
            form.stateListener.ignoreAny(a5);
        };
    }, [form, key]);

    return {
        value: form.values[key],
        defaultValue: form.defaultValues[key],
        dirty: form.dirtyMap[key],
        error: form.errorMap[key],
        state: form.state,
        form: form,
        setValue: (value: T[Key]) => form.setValue(key, value)
    };
}

export function useAnyListener<
    T extends ObjectOrArray,
    State extends ObjectOrArray,
    Error
>(form: Form<T, State, Error>, onlyOnUpdateAll: boolean = false) {
    const [, setRender] = useState(0);

    useEffect(() => {
        function causeRerender(updateAllWasUsed: boolean) {
            if (!onlyOnUpdateAll || updateAllWasUsed) setRender((e) => e + 1);
        }
        let a1 = form.valuesListener.listenAny(causeRerender);
        let a2 = form.defaultValuesListener.listenAny(causeRerender);
        let a3 = form.dirtyListener.listenAny(causeRerender);
        let a4 = form.errorListener.listenAny(causeRerender);
        let a5 = form.stateListener.listenAny(causeRerender);
        return () => {
            form.valuesListener.ignoreAny(a1);
            form.defaultValuesListener.ignoreAny(a2);
            form.dirtyListener.ignoreAny(a3);
            form.errorListener.ignoreAny(a4);
            form.stateListener.ignoreAny(a5);
        };
    }, [form]);

    return form;
}

export function useChildForm<
    Parent extends ObjectOrArray,
    ParentState extends ObjectOrArray,
    ParentError,
    Key extends KeyOf<Parent>
>(parentForm: Form<Parent, ParentState, ParentError>, key: Key) {
    let c = useRef<Form<Parent[Key], ParentState, ParentError> | null>(null);

    if (c.current === null) {
        c.current = new Form<Parent[Key], ParentState, ParentError>(
            parentForm.values[key], //?? ({} as any),
            parentForm.defaultValues[key] ?? ({} as any),
            parentForm.state
        );
    }

    useEffect(() => {
        // Listen for parent value changes on this child form
        let p1 = parentForm.valuesListener.listen(key, () => {
            c.current!.setValues(parentForm.values[key]);
        });
        let p2 = parentForm.defaultValuesListener.listen(key, () => {
            c.current!.setDefaultValues(
                parentForm.defaultValuesListener.values[key]
            );
        });
        let p3 = parentForm.dirtyListener.listen(key as any, () => {
            c.current!.dirtyListener.updateAll(
                parentForm.dirtyListener.values[key] || ({} as any)
            );
        });
        let p4 = parentForm.errorListener.listen(key as any, () => {
            c.current!.errorListener.updateAll(
                parentForm.errorListener.values[key] || ({} as any)
            );
        });
        let p5 = parentForm.stateListener.listenAny(() => {
            c.current!.stateListener.updateAll(parentForm.stateListener.values);
        });

        // Listen for any change on this form and notify parent on change
        let a1 = c.current!.valuesListener.listenAny(() => {
            parentForm.setValueInternal(
                key,
                c.current!.valuesListener.values,
                undefined,
                false
            );
        });
        let a2 = c.current!.defaultValuesListener.listenAny(() => {
            // Only update parent defaults for this field when a non default {} is set (can happen when a new array item is added)
            if (
                Object.keys(c.current!.defaultValuesListener.values).length > 0
            ) {
                parentForm.setValueInternal(
                    key,
                    c.current!.defaultValuesListener.values,
                    undefined,
                    true
                );
            }
        });
        let a3 = c.current!.dirtyListener.listenAny(() => {
            let d = c.current!.dirty
                ? (c.current!.dirtyListener.values as any)
                : undefined;
            console.log("updating parent dirty", key, d);
            parentForm.dirtyListener.update(key as any, d);
        });
        let a4 = c.current!.errorListener.listenAny(() => {
            parentForm.errorListener.update(
                key as any,
                c.current!.error
                    ? (c.current!.errorListener.values as any)
                    : undefined
            );
        });

        c.current!.valuesListener.updateAll(parentForm.values[key]);
        c.current!.defaultValuesListener.updateAll(
            parentForm.defaultValues[key] ?? ({} as any)
        );
        c.current!.recalculateDirty();
        if (c.current!.validator) c.current!.validateAll();

        return () => {
            parentForm.valuesListener.ignore(key, p1);
            parentForm.defaultValuesListener.ignore(key, p2);
            parentForm.dirtyListener.ignore(key as any, p3);
            parentForm.errorListener.ignore(key as any, p4);
            parentForm.stateListener.ignoreAny(p5);
            c.current!.valuesListener.ignoreAny(a1);
            c.current!.defaultValuesListener.ignoreAny(a2);
            c.current!.dirtyListener.ignoreAny(a3);
            c.current!.errorListener.ignoreAny(a4);
        };
    }, [parentForm, key]);

    useEffect(() => {
        return () => {
            // Do not set value to null on parentForm, because this child (and should be) unmounted because the parent value was set to null
            parentForm.dirtyListener.update(key as any, undefined);
            parentForm.errorListener.update(key as any, undefined);
        };
    }, []);

    return c.current;
}

export function useArrayForm<
    Parent extends ObjectOrArray,
    ParentState extends ObjectOrArray,
    ParentError,
    Key extends KeyOf<Parent>
>(parent: Form<Parent, ParentState, ParentError>, name: Key) {
    const form = useChildForm<Parent, ParentState, ParentError, Key>(
        parent,
        name
    );
    const [, setRender] = useState(0);

    useEffect(() => {
        let p1 = form.valuesListener.listenAny((all) => {
            if (all) {
                setRender((e) => e + 1);
            }
        });
        return () => {
            form.valuesListener.ignoreAny(p1);
        };
    }, [parent, name]);

    function append(value: Parent[Key][number]) {
        form.setValues([...(form.values as any), value] as any);
    }

    function remove(index: number) {
        let newValues = [...(form.values as any)];
        newValues.splice(index, 1);
        form.setValues(newValues as any);
    }

    function clear() {
        form.setValues([] as any);
    }

    function move(from: number, to: number) {
        if (to === from) return;
        let newArr = [...(form.values as any)];
        var target = newArr[from];
        var increment = to < from ? -1 : 1;
        for (var k = from; k !== to; k += increment) {
            newArr[k] = newArr[k + increment];
        }
        newArr[to] = target;
        form.setValues(newArr as any);
    }

    function swap(index: number, newIndex: number) {
        if (index === newIndex) {
            return;
        }
        let values = [...(form.values as any)];
        [values[index], values[newIndex]] = [values[newIndex], values[index]];
        form.setValues(values as any);
    }

    return {
        remove,
        move,
        swap,
        clear,
        append,
        form
    };
}

export function ArrayForm<
    Parent extends ObjectOrArray,
    ParentState extends ObjectOrArray,
    ParentError,
    Key extends KeyOf<Parent>
>(props: {
    parent: Form<Parent, ParentState, ParentError>;
    name: Key;
    children: (props: {
        form: Form<Parent[Key], ParentState, ParentError>;
        remove: (index: number) => void;
        clear: () => void;
        move: (index: number, newIndex: number) => void;
        swap: (index: number, newIndex: number) => void;
        append: (value: Parent[Key][number]) => void;
    }) => React.ReactNode;
}) {
    const arr = useArrayForm(props.parent, props.name);
    return <React.Fragment>{props.children(arr)}</React.Fragment>;
}
