import React, { useState, useEffect, useRef } from "react";

export type ObjectOrArray = {
    [TIndex in number | string]: any;
};

export type KeysOfType<T, TProp> = {
    [P in keyof T]: T[P] extends TProp ? P : never;
}[keyof T];

/**
 * The keys of a type T, when T is an array then it returns number (to index the array), otherwise, a key of the object.
 */
export type KeyOf<T> = T extends any[] ? number : keyof T;

type ErrorType<T, TError> = T extends ObjectOrArray
    ? ErrorMap<T, TError>
    : TError;
type ErrorMap<T extends ObjectOrArray, TError> = {
    [TKey in KeyOf<T>]?: ErrorType<T[TKey], TError>;
};

type AnyListener = (setValuesWasUsed: boolean) => void;
type AnyListenersMap = {
    [key: string]: AnyListener;
};

type Listener = (isDefault: boolean) => void;
type ListenerIdMap = {
    [key: string]: Listener;
};
type ListenersMap<T extends ObjectOrArray> = {
    [TKey in KeyOf<T>]?: ListenerIdMap;
};

type DirtyMap<T extends ObjectOrArray> = {
    [TKey in KeyOf<T>]?: boolean;
};

export type FormValidator<T, TError> = (values: T) => ErrorMap<T, TError>;

export type FormFieldProps<TProps, TForm, TFormError, TFormState> = Omit<
    TProps,
    "form" | "name"
> & {
    form: FormState<TForm, TFormError, TFormState>;
    name: KeyOf<TForm>;
};

// clones only the lower-most object
function memberCopy<T>(value: T): T {
    if (Array.isArray(value)) {
        return [...value] as any;
    } else if (typeof value === "object") {
        return { ...value };
    } else {
        throw new Error("Can only member-copy arrays and objects.");
    }
}

export class FormState<T extends ObjectOrArray, TError = string, TState = {}> {
    public readonly formId: number;
    public validateOnChange: boolean = true;
    public validator: FormValidator<T, TError> = () => ({});

    private anyListeners: AnyListenersMap = {};
    private listeners: ListenersMap<T> = {};
    private _values: T;
    private _defaultValues: T;
    private _dirtyMap: DirtyMap<T> = {};
    private _errorMap: ErrorMap<T, TError> = {};
    private _state: TState;
    private static currentId = 0;

    public get values() {
        return this._values;
    }

    public get defaultValues() {
        return this._defaultValues;
    }

    public get dirtyMap() {
        return this._dirtyMap;
    }

    public get errorMap() {
        return this._errorMap;
    }

    public get state() {
        return this._state;
    }

    constructor(
        initialValues: T,
        defaultValues: T,
        state: TState,
        validator: FormValidator<T, TError>,
        validateOnChange: boolean
    ) {
        if (!defaultValues || !initialValues)
            throw new Error(
                "FormState.constructor: initialValues or defaultValues is null"
            );
        this._state = state;
        this._values = initialValues;
        this._defaultValues = defaultValues;
        this.validateOnChange = validateOnChange;
        this.formId = FormState.currentId++;
        this.validator = validator;
    }

    public ignoreAny(id: string) {
        delete this.anyListeners[id];
    }

    public ignore(key: KeyOf<T>, id: string) {
        let setters = this.listeners[key];
        if (!setters) {
            console.warn("Ignore was called for no reason", key, id);
            return;
        }
        delete setters[id];
    }

    /**
     * Invokes a callback when a specified field changes.
     * @param key The field to listen to.
     * @param listener The callback to invoke when the field changes.
     * @returns An id to pass to `ignore()` when you don't want to listen to the field anymore.
     */
    public listen(key: KeyOf<T>, listener: Listener): string {
        let setters = this.listeners[key];
        if (!setters) {
            setters = {};
            this.listeners[key] = setters;
        }
        let id = "" + FormState.currentId++;
        setters[id] = listener;
        return id;
    }

    /**
     * Invokes a callback when any field on this form has changed.
     * @param listener The callback to invoke.
     */
    public listenAny(listener: AnyListener) {
        let id = "" + FormState.currentId++;
        this.anyListeners[id] = listener;
        return id;
    }

    /**
     * Returns true if any field on this form or any child form is marked as dirty. (Not parent forms)
     */
    public get dirty(): boolean {
        // return true if some field was marked as dirty
        if (
            Object.keys(this._dirtyMap).some(
                (key) => this._dirtyMap[key as KeyOf<T>]
            )
        )
            return true;

        // return true if a field was added or removed
        let valueKeys = Object.keys(this._values);
        if (valueKeys.length !== Object.keys(this._defaultValues).length)
            return true;

        return false;
    }

    /**
     * Returns true if any error is set on this form or any child form. (Not parent forms)
     */
    public get error(): boolean {
        return Object.keys(this._errorMap).length > 0; //some((key) => this.errors[key as KeyType<T>])
    }

    /**
     * Sets the state on this form, will notify child forms. (PARENT FORMS COULD BE NOTIFIED TOO IN A FUTURE VERSION)
     * @param state The new state
     */
    public setState(state: TState) {
        this._state = state;
        this.fireAllNormalListeners(false);
        this.fireAnyListeners(false);
    }

    /**
     * Resets this form, and child forms, back to its unchanged state.
     * @param values The new default values, leave undefined to use the original default values.
     */
    public reset(values?: T) {
        this.setValues(values ?? this._defaultValues, {}, true);
    }

    /**
     * Sets a value on the form, will use the builtin validator. For manual validation, use setValueInternal.
     * When settings object/array fields, you should use setValueInternal instead, as object/array fields cannot be dirty-checked by value (will always mark dirty when the reference has changed).
     * @param key The field name to set.
     * @param value The new field value.
     */
    public setValue<U extends KeyOf<T>>(key: U, value: T[U]) {
        if (
            (value !== null && typeof value === "object") ||
            Array.isArray(value)
        ) {
            console.warn(
                "Do not pass objects to setValue, use setValueInternal instead. When passing objects here, they will always be treated as dirty."
            );
        }
        if (this._values[key] === value) return;
        this.setValueInternal(key, value, this._defaultValues[key] !== value);
    }

    /**
     * Remove errors and dirty values for a field.
     * @param key The field name to remove errors and dirty flags for.
     */
    public unsetValue(key: KeyOf<T>) {
        delete this._dirtyMap[key];
        delete this._errorMap[key];
        this.fireListener(key);
        this.fireAnyListeners(false);
    }

    public setDirty(key: KeyOf<T>, dirty: boolean, skipId?: string) {
        if (this._dirtyMap[key] === dirty) return;
        this._dirtyMap[key] = dirty;
        this.fireListener(key, false, skipId);
        this.fireAnyListeners(false, skipId);
    }

    /**
     * Set a value the advanced way.
     * @param key The field name to set.
     * @param value The new value of the field.
     * @param dirty Is this field dirty?
     * @param error The error in this field, leave undefined to use the forms validator, use null to clear errors on this field.
     * @param skipId The field listener to skip.
     */
    public setValueInternal<U extends KeyOf<T>, V extends T[U]>(
        key: U,
        value: V,
        dirty: boolean,
        error?: ErrorType<V, TError> | null | undefined,
        skipId?: string
    ) {
        this._values[key] = value;
        this._dirtyMap[key] = dirty;
        if (error !== undefined) {
            if (error === null || Object.keys(error).length === 0)
                delete this._errorMap[key];
            else this._errorMap[key] = error;
        } else if (this.validateOnChange) {
            this._errorMap = this.validator(this._values);
        }

        this.fireListener(key, false, skipId);
        this.fireAnyListeners(false, skipId);
    }

    /**
     * Force validation on this form. This is not needed when validateOnChange is enabled.
     */
    public validate() {
        this.setErrors(this.validator(this._values));
    }

    /**
     * Sets errors in this form, also notifies parent and child forms.
     * @param errors The errors to set in this form.
     * @param skipId The field listener to skip.
     */
    public setErrors(errors: ErrorMap<T, TError>, skipId?: string) {
        if (
            Object.keys(this._errorMap).length === 0 &&
            Object.keys(errors).length === 0
        )
            return;
        this._errorMap = errors;

        this.fireAllNormalListeners(false, skipId);
        this.fireAnyListeners(true, skipId);
    }

    /**
     * Sets an error for a field in this form, also notifies parent and child forms.
     * @param name The field name to set an error for.
     * @param error The error to set on said field.
     */
    public setError<U extends KeyOf<T>>(
        name: U,
        error: ErrorType<T[U], TError>
    ) {
        if (this._errorMap[name] === error) return;
        this._errorMap[name] = error;
        this.fireAllNormalListeners(false);
        this.fireAnyListeners(true);
    }

    /**
     * Set all the values in this form, notifies parent and child forms. Also calculate dirty values fields.
     * @param setValues The values to set in this form, will also notify parent and child forms.
     * @param errors The errors to set on this form, leave undefined to use the validator.
     * @param isDefault Are these values the default values of the form?
     * @param state The state of the form.
     * @param skipId The field listener to skip.
     */
    public setValues(
        setValues: T,
        errors?: ErrorMap<T, TError>,
        isDefault?: boolean,
        state?: TState,
        skipId?: string
    ) {
        if (errors === null)
            throw new Error(
                "errors is null, use undefined to not set any errors"
            );
        if (!setValues) throw new Error("setValues is undefined");

        if (isDefault) {
            this._defaultValues = setValues;
            this._values = memberCopy(setValues);
            this._dirtyMap = {};
        } else {
            this._values = setValues;
        }

        if (errors !== undefined) this._errorMap = errors;
        else this._errorMap = this.validator(this._values);

        if (state !== undefined) this._state = state;

        this.fireAllNormalListeners(isDefault, skipId);
        this.recalculateDirty();
        this.fireAnyListeners(true, skipId);
    }

    private recalculateDirty() {
        // Recalculate dirty values
        let keys = Object.keys(this._values);
        for (let i = 0; i < keys.length; i++) {
            let name = keys[i] as KeyOf<T>;
            let value = this._values[name];
            // Do not compare objects and arrays, they are set dirty using setValueInternal
            if (typeof value === "object" || Array.isArray(value)) continue;
            this._dirtyMap[name] = this._defaultValues[name] !== value;
        }
    }

    private fireListener(key: KeyOf<T>, isDefault?: boolean, skipId?: string) {
        let listeners = this.listeners[key];
        if (listeners) {
            // Call all listeners for the set field
            Object.keys(listeners!).forEach((id) => {
                if (id !== skipId) listeners![id](isDefault ?? false);
            });
        }
    }

    private fireAllNormalListeners(isDefault?: boolean, skipId?: string) {
        // Call all listeners for each set field
        Object.keys(this._values).forEach((keyString) => {
            this.fireListener(keyString as KeyOf<T>, isDefault, skipId);
        });
    }

    private fireAnyListeners(setValuesWasUsed: boolean, skipId?: string) {
        // Call all listeners that listen for any change
        Object.keys(this.anyListeners).forEach((id) => {
            if (id !== skipId) this.anyListeners[id](setValuesWasUsed);
        });
    }
}

export function useAnyListener<T extends ObjectOrArray, TError, TState>(
    form: FormState<T, TError, TState>,
    onlyOnSetValues: boolean = false
) {
    const [, setRender] = useState(0);

    useEffect(() => {
        let id = form.listenAny((setValuesWasUsed) => {
            if (!onlyOnSetValues || setValuesWasUsed) setRender((r) => r + 1);
        });
        return () => form.ignoreAny(id);
    }, [form, onlyOnSetValues]);

    return form;
}

export type AnyListenerProps<T extends ObjectOrArray, TError, TState> = {
    form: FormState<T, TError, TState>;
    onlyOnSetValues?: boolean;
    render: (props: FormState<T, TError, TState>) => React.ReactNode;
};

export function AnyListener<T extends ObjectOrArray, TError, TState>(
    props: AnyListenerProps<T, TError, TState>
) {
    const values = useAnyListener(props.form, props.onlyOnSetValues);
    return <React.Fragment>{props.render(values)}</React.Fragment>;
}

export type ListenerProps<
    T extends ObjectOrArray,
    TKey extends KeyOf<T>,
    TValue extends T[TKey],
    TError,
    TState
> = {
    form: FormState<T, TError, TState>;
    name: TKey;
    render: (props: {
        value: TValue;
        dirty?: boolean;
        error?: ErrorType<TValue, TError>;
        state: TState;
        setValue: (value: TValue) => void;
    }) => React.ReactNode;
};

export function Listener<
    T extends ObjectOrArray,
    TKey extends KeyOf<T>,
    TValue extends T[TKey],
    TError,
    TState
>(props: ListenerProps<T, TKey, TValue, TError, TState>) {
    const values = useListener(props.form, props.name);
    return <React.Fragment>{props.render(values)}</React.Fragment>;
}

export function useListener<
    T extends ObjectOrArray,
    TKey extends KeyOf<T>,
    TError,
    TState
>(form: FormState<T, TError, TState>, name: TKey) {
    const [, setRender] = useState(0);

    useEffect(() => {
        let id = form.listen(name, () => setRender((r) => r + 1));
        return () => form.ignore(name, id);
    }, [form, name]);

    return {
        dirty: form.dirtyMap[name],
        error: form.errorMap[name],
        value: form.values[name],
        state: form.state,
        setValue: (value: T[TKey]) => form.setValue(name, value)
    };
}

export type FormProps<T extends ObjectOrArray, TError, TState> = {
    values: T;
    render: (form: FormState<T, TError, TState>) => React.ReactNode;
};

export function Form<T extends ObjectOrArray, TError, TState>(
    props: FormProps<T, TError, TState>
) {
    const form = useForm<T, TError, TState>(props.values);
    return props.render(form);
}

export type ChildFormProps<
    TParent extends ObjectOrArray,
    TKey extends KeyOf<TParent>,
    TValue extends TParent[TKey],
    TError,
    TState
> = {
    parent: FormState<TParent, TError, TState>;
    name: TKey;
    render: (form: FormState<TValue, TError, TState>) => JSX.Element;
    validator?: FormValidator<TValue, TError>;
};

export function ChildForm<
    TParent extends ObjectOrArray,
    TKey extends KeyOf<TParent>,
    TValue extends TParent[TKey],
    TError,
    TState
>(props: ChildFormProps<TParent, TKey, TValue, TError, TState>) {
    const childForm = useChildForm(props.parent, props.name, props.validator);
    return props.render(childForm);
}

export function useForm<T, TError = string, TState = {}>(
    values: T,
    defaultState: TState = {} as any,
    validator: FormValidator<T, TError> = () => ({}),
    validateOnMount = false,
    validateOnChange = true
) {
    let ref = useRef<FormState<T, TError, TState> | null>(null);

    if (!ref.current) {
        ref.current = new FormState<T, TError, TState>(
            memberCopy(values),
            values,
            defaultState,
            validator,
            validateOnChange
        );
    }

    useEffect(() => {
        ref.current!.setValues(values, validateOnMount ? undefined : {}, true);
    }, [values, validateOnMount]);

    return ref.current!;
}

export function useChildForm<
    TParent extends ObjectOrArray,
    TKey extends KeyOf<TParent>,
    TValue extends TParent[TKey],
    TError,
    TState
>(
    parent: FormState<TParent, TError, TState>,
    name: TKey,
    validator: FormValidator<TValue, TError> = () => ({}),
    validateOnChange = true
) {
    let ref = useRef<FormState<TValue, TError, TState> | null>(null);

    if (!ref.current) {
        ref.current = new FormState<TValue, TError, TState>(
            memberCopy(parent.values[name]),
            parent.defaultValues[name] ?? parent.values[name],
            parent.state,
            validator,
            validateOnChange
        );
    }

    useEffect(() => {
        let parentId = parent.listen(name, (isDefault) => {
            ref.current!.setValues(
                parent.values[name],
                parent.errorMap[name] ?? undefined, // undefined causes validate, {} sets no errors and causes no validation
                isDefault,
                parent.state,
                id
            );
        });
        let id = ref.current!.listenAny(() => {
            parent.setValueInternal(
                name,
                ref.current!.values,
                ref.current!.dirty,
                ref.current!.errorMap as ErrorType<TValue, TError>,
                parentId
            );
        });
        ref.current!.setValues(
            memberCopy(parent.values[name]),
            parent.errorMap[name]
        );

        let i = ref.current!;
        return () => {
            i.ignoreAny(id);
            parent.ignore(name, parentId);
            parent.unsetValue(name);
        };
    }, [parent, name]);

    return ref.current!;
}

export function yupValidator<T>(
    schema: any,
    transform: (message: any) => any = (s) => s
) {
    return (values: T) => {
        try {
            schema.validateSync(values, { abortEarly: false });
            return {};
        } catch (ex) {
            return yupErrorsToErrorMap(ex.inner, transform);
        }
    };
}

export function yupErrorsToErrorMap(
    errors: any[],
    transform: (message: any) => any = (s) => s
) {
    let obj = {} as any;
    for (let i = 0; i < errors.length; i++) {
        let err = errors[i];
        let pathSegments = [...err.path.matchAll(/(\w+)/gi)].map((e) => e[0]);
        let o = obj;
        for (let j = 0; j < pathSegments.length; j++) {
            let key = pathSegments[j];
            let oo = o[key];
            if (!oo) {
                oo = {};
                o[key] = oo;
            }
            if (j === pathSegments.length - 1) {
                o[key] = transform(err.message);
            } else {
                o = oo;
            }
        }
    }
    return obj;
}

export type ErrorFieldProps<T extends ObjectOrArray, TError, TState> = {
    form: FormState<T, TError, TState>;
    name: KeyOf<T>;
    as: (props: { children: React.ReactNode }) => JSX.Element;
};

export function ErrorField<T extends ObjectOrArray, TError, TState>(
    props: ErrorFieldProps<T, TError, TState>
) {
    const { error } = useListener(props.form, props.name);
    if (!error) return null;
    return props.as({ children: error });
}

export type ArrayFieldProps<
    TParent extends ObjectOrArray,
    TKey extends KeyOf<TParent>,
    T extends TParent[TKey],
    TError,
    TState
> = {
    parent: FormState<TParent, TError, TState>;
    name: TKey;
    render: (props: {
        form: FormState<T, TError, TState>;
        values: T;
        setValues: (values: T) => void;
        remove: (index: number) => void;
        clear: () => void;
        move: (index: number, newIndex: number) => void;
        swap: (index: number, newIndex: number) => void;
        append: (value: T[number]) => void;
    }) => React.ReactNode;
};

export function ArrayField<
    TParent extends ObjectOrArray,
    TKey extends KeyOf<TParent>,
    T extends TParent[TKey],
    TError,
    TState
>(props: ArrayFieldProps<TParent, TKey, T, TError, TState>) {
    const form = useChildForm<TParent, TKey, T, TError, TState>(
        props.parent,
        props.name
    );

    function append(value: T[number]) {
        form.setValues([...(form.values as any), value] as any);
    }

    function remove(index: number) {
        let newValues = [...(form.values as any)];
        newValues.splice(index, 1);
        let newErrors = { ...form.errorMap };
        delete (newErrors as any)[index];
        form.setValues(newValues as any, newErrors);
    }

    function clear() {
        form.setValues([] as any, {});
    }

    function move(from: number, to: number) {
        if (to === from) return;
        let newArr = [...(form.values as any)] as T;
        let newErr = { ...form.errorMap } as ErrorMap<T, TError>;
        var target = newArr[from];
        var targetErr = newErr[from];
        var increment = to < from ? -1 : 1;
        for (var k = from; k !== to; k += increment) {
            newArr[k] = newArr[k + increment];
            newErr[k] = newErr[k + increment];
        }
        newArr[to] = target;
        newErr[to] = targetErr;
        form.setValues(newArr, newErr);
    }

    function swap(index: number, newIndex: number) {
        let values = [...(form.values as any)];
        [values[index], values[newIndex]] = [values[newIndex], values[index]];
        let errors = { ...form.errorMap };
        [errors[index], errors[newIndex]] = [errors[newIndex], errors[index]];
        form.setValues(values as any, errors);
    }

    return (
        <AnyListener
            onlyOnSetValues
            form={form}
            render={({ values, setValues }) =>
                props.render({
                    form,
                    values,
                    setValues,
                    remove,
                    move,
                    swap,
                    clear,
                    append
                })
            }
        />
    );
}
