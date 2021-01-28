import { useEffect, useRef, useState } from "react";

export type ListenerCallback = () => void;
export type ListenerMap = { [T in string]?: ListenerCallback };

// function memberCopy<T>(value: T): T {
//     if (Array.isArray(value)) {
//         return [...value] as any;
//     } else if (typeof value === "object") {
//         return { ...value };
//     } else {
//         throw new Error("Can only memberCopy() arrays and objects.");
//     }
// }

// function changedKeys<T>(
//     a: T,
//     b: T,
//     objectCompareMode: "skip" | "truthy" | "compare" = "truthy"
// ): (keyof T)[] {
//     if (a === b) return [];
//     let aKeys = Object.keys(a);
//     let bKeys = Object.keys(b);
//     let largest = aKeys.length > bKeys.length ? aKeys : bKeys;
//     let changed = [];
//     const o = {};
//     for (let i = 0; i < largest.length; i++) {
//         let k = largest[i];
//         let av = a[k as any];
//         let bv = b[k as any];
//         if (typeof av === "object" || typeof bv === "object") {
//             if (objectCompareMode === "truthy") {
//                 if (typeof av === "object") av = av ? o : undefined;
//                 if (typeof bv === "object") bv = bv ? o : undefined;
//             } else if (objectCompareMode === "skip") {
//                 continue;
//             }
//         }
//         if (av !== bv) {
//             changed.push(k);
//         }
//     }
//     return changed as (keyof T)[];
// }

type ChildFormMap<T> = {
    [Key in keyof T]?: ChildForm<T, Key>;
};

type DirtyMap<T> = {
    [Key in keyof T]?: boolean;
};

export class Form<T> {
    public values: T;
    public defaultValues: T;
    public childMap: ChildFormMap<T> = {};
    public dirtyMap: DirtyMap<T> = {};
    public listeners: { [Key in keyof T]?: ListenerMap } = {};
    public anyListeners: ListenerMap = {};

    private counter = 0;

    public constructor(defaultValues: T) {
        this.values = { ...defaultValues };
        this.defaultValues = { ...defaultValues };
    }

    public get dirty() {
        return Object.keys(this.dirtyMap).some((e) => this.dirtyMap[e]);
    }

    public setValueInternal<Key extends keyof T>(
        key: Key,
        value: T[Key],
        dirty: boolean | undefined,
        isDefault: boolean,
        notifyChild: boolean,
        notifyParent: boolean,
        fireAny: boolean
    ) {
        if (isDefault) this.defaultValues[key] = value;
        else this.values[key] = value;
        if (dirty !== undefined) this.dirtyMap[key] = dirty;
        if (notifyChild) this.childMap[key]?.setValues(value, isDefault);
        if (notifyParent) void 0; // Not implemented for topmost form
        this.fireListeners(key);
        if (fireAny) this.fireAnyListeners(); // Will be false when using setValues, he will call fireAnyListeners itself
    }

    public setValue<Key extends keyof T>(
        key: Key,
        value: T[Key],
        isDefault: boolean = false
    ) {
        if (typeof value === "object") {
            this.setValueInternal(
                key,
                value,
                undefined,
                isDefault,
                true,
                true,
                true
            );
        } else {
            if (this.values[key] === value) return false;
            this.setValueInternal(
                key,
                value,
                isDefault
                    ? value !== this.values[key]
                    : value !== this.defaultValues[key],
                isDefault,
                true,
                true,
                true
            );
        }
        return true;
    }

    public setValues(values: T, isDefault: boolean = false) {
        let k = Object.keys(values);
        for (let i = 0; i < k.length; i++) {
            let key = k[i] as keyof T;
            this.setValue(key, values[key], isDefault);
        }
        this.fireAnyListeners();
    }

    public reset() {
        this.setValues({ ...this.defaultValues }, true);
    }

    public listen(key: keyof T, listener: ListenerCallback): string {
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

    public ignore(key: keyof T, id: string) {
        if (!this.listeners) return;
        let setters = this.listeners[key];
        if (!setters) {
            console.warn("Ignore was called for no reason", key, id);
            return;
        }
        delete setters[id];
    }

    protected fireListeners(key: keyof T) {
        let a = this.listeners[key];
        if (a) {
            let l = Object.keys(a!);
            l.forEach((e) => a![e]!());
        }
    }

    protected fireAnyListeners() {
        let al = Object.keys(this.anyListeners);
        al.forEach((e) => this.anyListeners[e]!());
    }
}

export class ChildForm<Parent, Key extends keyof Parent> extends Form<
    Parent[Key]
> {
    public name: Key;
    public parent: Form<Parent>;

    public constructor(parent: Form<Parent>, name: Key) {
        super(parent.defaultValues[name]);
        this.parent = parent;
        this.name = name;
        parent.childMap[name] = this;
    }

    public setValueInternal<ParentKey extends keyof Parent[Key]>(
        key: ParentKey,
        value: Parent[Key][ParentKey],
        dirty: boolean | undefined,
        isDefault: boolean,
        notifyChild: boolean,
        notifyParent: boolean,
        fireAny: boolean
    ) {
        if (isDefault) this.defaultValues[key] = value;
        else this.values[key] = value;
        if (dirty !== undefined) this.dirtyMap[key] = dirty;
        if (notifyChild) this.childMap[key]?.setValues(value, isDefault);
        if (notifyParent)
            this.parent.setValueInternal(
                this.name,
                this.values,
                this.dirty,
                isDefault,
                false,
                true,
                true
            );
        this.fireListeners(key);
        if (fireAny) this.fireAnyListeners(); // Will be false when using setValues, he will call fireAnyListeners itself
    }
}

export function useForm<T>(defaultValues: T) {
    let c = useRef<Form<T> | null>(null);

    if (!c.current) {
        c.current = new Form(defaultValues);
    }

    useEffect(() => {
        c.current!.setValues(defaultValues, true);
    }, [defaultValues]);

    return c.current;
}

export function useChildForm<T, Key extends keyof T>(
    parentForm: Form<T>,
    name: Key
) {
    let c = useRef<ChildForm<T, Key> | null>(null);
    if (!c.current) {
        c.current = new ChildForm(parentForm, name);
    }

    useEffect(() => {
        console.log("register child form");
        return () => console.log("unregister child form");
    }, [parentForm, name]);

    return c.current;
}

export function useListener<T, Key extends keyof T>(form: Form<T>, name: Key) {
    const [, setRender] = useState(0);

    useEffect(() => {
        let id = form.listen(name, () => setRender((e) => e + 1));
        return () => form.ignore(name, id);
    }, [form, name]);

    return {
        value: form.values[name],
        setValue: (value: T[Key]) => form.setValue(name, value),
        form
    };
}

export function useAnyListener<T>(form: Form<T>) {
    const [, setRender] = useState(0);

    useEffect(() => {
        let id = form.listenAny(() => setRender((e) => e + 1));
        return () => form.ignoreAny(id);
    }, [form]);

    return form;
}

// let form = new Form({ firstName: "stijn", info: { age: 20 } });
// let form2 = new ChildForm(form, "info");
