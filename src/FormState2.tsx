import { useEffect, useRef, useState } from "react";

export type ObjectOrArray = {
    [Key in number | string]: any;
};

export type KeyOf<T> = T extends any[] ? number : keyof T;

export type ListenerCallback = () => void;

type ListenerMap = { [T in string]?: ListenerCallback };

function keys<T>(obj: T): KeyOf<T>[] {
    if (Array.isArray(obj)) {
        return Array.from(Array(obj.length).keys()) as any;
    } else if (typeof obj === "object") {
        return Object.keys(obj) as any;
    } else {
        throw new Error("Can only keys() arrays and objects.");
    }
}

function changedKeys<T>(
    a: T,
    b: T,
    compareObjectsAsBooleans: boolean = false
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
        if (av === null && bv === undefined)
            console.warn("comparing null and undefined!");
        if (compareObjectsAsBooleans && typeof av === "object")
            av = av ? o : undefined;
        if (compareObjectsAsBooleans && typeof bv === "object")
            bv = bv ? o : undefined;
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

    public update(key: KeyOf<T>, value: T[KeyOf<T>]) {
        if (
            typeof this._values[key] !== "object" &&
            this._values[key] === value
        )
            return;
        this._values[key] = value;
        super.fire(key);
    }

    public updateAll(values: T) {
        if (this._values === values) return;
        let changed = changedKeys(this._values, values, false);
        this._values = values;
        super.fireMultiple(changed);
    }
}

export class Form<T extends ObjectOrArray> {
    // private _values: T;
    // private _defaultValues: T;

    public valuesListener: ObjectListener<T>;
    public defaultValuesListener: ObjectListener<T>;

    public get values() {
        return this.valuesListener.values;
    }

    public get defaultValues() {
        return this.defaultValuesListener.values;
    }

    constructor(values: T, defaultValues: T) {
        this.valuesListener = new ObjectListener(values);
        this.defaultValuesListener = new ObjectListener(defaultValues);
    }

    public setValues(values: T) {
        this.valuesListener.updateAll(values);
    }

    public setDefaultValues(defaultValues: T) {
        this.defaultValuesListener.updateAll(defaultValues);
    }

    public setValue<Key extends KeyOf<T>>(key: Key, value: T[Key]) {
        this.valuesListener.update(key, value);
    }

    public setDefaultValue<Key extends KeyOf<T>>(key: Key, value: T[Key]) {
        this.defaultValuesListener.update(key, value);
    }
}

export function useForm<T>(defaultValues: T): Form<T> {
    let c = useRef<Form<T> | null>(null);

    if (c.current === null) {
        c.current = new Form<T>(defaultValues, defaultValues);
    }

    return c.current;
}

export function useListener<T extends ObjectOrArray>(
    form: Form<T>,
    key: KeyOf<T>
) {
    const [, setRender] = useState(0);

    useEffect(() => {
        form.valuesListener.listen(key, () => {
            setRender((e) => e + 1);
        });
    }, [form, key]);

    return form.values[key];
}

export function useAnyListener<T extends ObjectOrArray>(form: Form<T>) {
    const [, setRender] = useState(0);

    useEffect(() => {
        form.valuesListener.listenAny(() => {
            setRender((e) => e + 1);
        });
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
            parentForm.values[key],
            parentForm.defaultValues[key]
        );
    }

    useEffect(() => {
        parentForm.valuesListener.listen(key, () => {
            c.current!.setValues(parentForm.values[key]);
        });
        parentForm.defaultValuesListener.listen(key, () => {
            c.current!.setDefaultValues(parentForm.defaultValues[key]);
        });
        c.current!.valuesListener.listenAny(() => {
            parentForm.valuesListener.update(
                key,
                c.current!.valuesListener.values
            );
        });
    }, [parentForm, key]);

    useEffect(() => {
        parentForm.defaultValuesListener.listen(key, () => {
            c.current!.setDefaultValues(parentForm.defaultValues[key]);
        });
    }, [parentForm.defaultValues[key]]);

    useEffect(() => {
        parentForm.valuesListener.listen(key, () => {
            c.current!.setValues(parentForm.values[key]);
        });
    }, [parentForm.values[key]]);

    return c.current;
}
