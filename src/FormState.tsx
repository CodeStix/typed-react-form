import { useEffect, useRef, useState } from "react";

export type ObjectOrArray = {
    [Key in number | string]: any;
};

export type KeyOf<T extends ObjectOrArray> = T extends any[] ? number : keyof T;

export type ListenerCallback = () => void;
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

    public fireMultiple(key: Key[]) {
        key.forEach((e) => this.fire(e));
    }

    public fire(key: Key) {
        if (this.listeners) {
            let l = this.listeners[key];
            if (l) {
                Object.keys(l!).forEach((e) => l![e]!());
            }
        }
        if (this.anyListeners) {
            Object.keys(this.anyListeners).forEach((e) =>
                this.anyListeners![e]!()
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
        this._values = initialValues;
    }

    public update(key: KeyOf<T>, value: T[KeyOf<T>] | undefined) {
        if (
            (typeof this._values[key] !== "object" ||
                Array.isArray(this._values[key])) &&
            this._values[key] === value
        )
            return;
        // console.log("update", key, value);
        if (value === undefined) delete this._values[key];
        else this._values[key] = value;
        super.fire(key);
    }

    public updateAll(values: T) {
        if (this._values === values) return;
        // console.log("update all", values);
        let changed = changedKeys(this._values, values, "compare");
        this._values = values;
        super.fireMultiple(changed);
    }
}

export class Form<T extends ObjectOrArray, Error = string> {
    // private _values: T;
    // private _defaultValues: T;

    public valuesListener: ObjectListener<T>;
    public defaultValuesListener: ObjectListener<T>;
    public dirtyListener: ObjectListener<DirtyMap<T>>;
    public errorListener: ObjectListener<ErrorMap<T, Error>>;
    public validator?: Validator<T, Error>;
    public validateOnChange: boolean;

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
        return Object.keys(this.dirtyListener.values).some(
            (e) => this.dirtyListener.values[e]
        );
    }

    public get error() {
        return Object.keys(this.errorListener.values).some(
            (e) => this.errorListener.values[e]
        );
    }

    constructor(
        values: T,
        defaultValues: T,
        validator?: Validator<T, Error>,
        validateOnChange: boolean = true
    ) {
        this.validator = validator;
        this.validateOnChange = validateOnChange;
        this.valuesListener = new ObjectListener(memberCopy(values));
        this.defaultValuesListener = new ObjectListener(
            memberCopy(defaultValues)
        );
        this.dirtyListener = new ObjectListener({});
        this.errorListener = new ObjectListener({});
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
            d[e] = a !== b;
        }
        this.dirtyListener.updateAll(d);
    }

    public setValues(values: T, validate: boolean = true) {
        if (this.values === values) return;
        if (!values) {
            console.warn("setValues was called with undefined");
            return;
        }
        this.valuesListener.updateAll(memberCopy(values));
        this.recalculateDirty();
        if (validate && this.validator) this.validateAll();
    }

    public setDefaultValues(defaultValues: T, validate: boolean = true) {
        this.defaultValuesListener.updateAll(memberCopy(defaultValues));
        this.recalculateDirty();
        if (validate && this.validator) this.validateAll();
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
        console.log(
            "setValueInternal",
            this.valuesListener.values[key] === value,
            key,
            value,
            dirty,
            isDefault
        );
        if (isDefault) this.defaultValuesListener.update(key, value);
        else this.valuesListener.update(key, value);
        if (dirty !== undefined)
            this.dirtyListener.update(key as any, dirty as any);
        if (this.validator && this.validateOnChange) this.validateAll(); // use this.validate instead?
    }
}

export function useForm<T extends ObjectOrArray, Error = string>(
    defaultValues: T,
    validator?: Validator<T, Error>,
    validateOnChange: boolean = true
) {
    let c = useRef<Form<T, Error> | null>(null);

    if (c.current === null) {
        c.current = new Form<T, Error>(
            defaultValues,
            defaultValues,
            validator,
            validateOnChange
        );
    }

    useEffect(() => {
        c.current!.setDefaultValues(defaultValues);
    }, [defaultValues]);

    return c.current;
}

// export function useArrayListener<T extends ObjectOrArray, Key extends KeyOf<T>>(form: Form<T>, key: Key) {
//     const [state, setState] = useState(form.values[key]);

//     useEffect(() => {
//         form.valuesListener.listen(key, () => {

//         });
//     }, [key]);

// }

export function useListener<T extends ObjectOrArray, Key extends KeyOf<T>>(
    form: Form<T>,
    key: Key
) {
    const [, setRender] = useState(0);

    useEffect(() => {
        form.valuesListener.listen(key, () => {
            if (key === "todos")
                console.trace("array changed", form.values[key]);
            setRender((e) => e + 1);
        });
        form.defaultValuesListener.listen(key, () => {
            setRender((e) => e + 1);
        });
        form.dirtyListener.listen(key as any, () => {
            setRender((e) => e + 1);
        });
        form.errorListener.listen(key as any, () => {
            setRender((e) => e + 1);
        });
    }, [form, key]);

    return {
        value: form.values[key],
        defaultValue: form.defaultValues[key],
        dirty: form.dirtyMap[key],
        error: form.errorMap[key],
        setValue: (value: T[Key]) => form.setValue(key, value)
    };
}

export function useAnyListener<T extends ObjectOrArray>(form: Form<T>) {
    const [, setRender] = useState(0);

    useEffect(() => {
        let a1 = form.valuesListener.listenAny(() => {
            setRender((e) => e + 1);
        });
        let a2 = form.defaultValuesListener.listenAny(() => {
            setRender((e) => e + 1);
        });
        let a3 = form.dirtyListener.listenAny(() => {
            setRender((e) => e + 1);
        });
        let a4 = form.errorListener.listenAny(() => {
            setRender((e) => e + 1);
        });

        return () => {
            form.valuesListener.ignoreAny(a1);
            form.defaultValuesListener.ignoreAny(a2);
            form.dirtyListener.ignoreAny(a3);
            form.errorListener.ignoreAny(a4);
        };
    }, [form]);

    return form;
}

export function useChildForm<
    Parent extends ObjectOrArray,
    Key extends KeyOf<Parent>
>(parentForm: Form<Parent>, key: Key) {
    let c = useRef<Form<Parent[Key]> | null>(null);

    if (c.current === null) {
        c.current = new Form<Parent[Key]>(
            parentForm.values[key] ??
                parentForm.defaultValues[key] ??
                ({} as any),
            parentForm.defaultValues[key] ?? ({} as any)
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
            parentForm.setValueInternal(
                key,
                c.current!.defaultValuesListener.values,
                undefined,
                true
            );
        });
        let a3 = c.current!.dirtyListener.listenAny(() => {
            parentForm.dirtyListener.update(
                key as any,
                c.current!.dirty
                    ? (c.current!.dirtyListener.values as any)
                    : false
            );
        });
        let a4 = c.current!.errorListener.listenAny(() => {
            parentForm.errorListener.update(
                key as any,
                c.current!.error
                    ? (c.current!.errorListener.values as any)
                    : undefined
            );
        });

        c.current!.setValues(
            parentForm.values[key] ?? parentForm.defaultValues[key]
        );

        return () => {
            parentForm.valuesListener.ignore(key, p1);
            parentForm.defaultValuesListener.ignore(key, p2);
            parentForm.dirtyListener.ignore(key as any, p3);
            parentForm.errorListener.ignore(key as any, p4);
            c.current!.valuesListener.ignoreAny(a1);
            c.current!.defaultValuesListener.ignoreAny(a2);
            c.current!.dirtyListener.ignoreAny(a3);
            c.current!.errorListener.ignoreAny(a4);

            parentForm.valuesListener.update(key, undefined as any); // null
            parentForm.dirtyListener.update(key as any, undefined); // !!parentForm.defaultValues[key]
            parentForm.errorListener.update(key as any, undefined);
        };
    }, [parentForm, key]);

    useEffect(() => {
        // TODO update dirty and validate
    });

    return c.current;
}
