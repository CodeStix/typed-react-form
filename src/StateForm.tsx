import React, { useState, useEffect, useRef } from 'react'

type ObjectOrArray = {
    [TIndex in number | string]: any
}

// How it works: https://github.com/microsoft/TypeScript/issues/28046
type ArrayToStringType<T> = T extends ReadonlyArray<infer ElementType>
    ? ElementType
    : never

// https://stackoverflow.com/questions/50837171/remove-properties-of-a-type-from-another-type
type OnlyPropertiesOfType<T, U> = {
    [P in keyof T]: Exclude<T[P], undefined> extends U ? T[P] : never
}
export type KeyType<T> = T extends any[] ? number : keyof T
type KeyTypes<T extends ObjectOrArray, TKeys extends any[]> = {
    // KeyType<T>[]
    [U in ArrayToStringType<TKeys>]: T[U]
}

type ErrorType<T, TError = string> = T extends ObjectOrArray
    ? ErrorMap<T>
    : TError
type ErrorMap<T extends ObjectOrArray> = {
    [TKey in KeyType<T>]?: ErrorType<T[TKey]>
}

type AnyListener = (setValuesWasUsed: boolean) => void
type AnyListenersMap = {
    [key: string]: AnyListener
}

type Listener<TValue> = (
    value: TValue,
    error: ErrorType<TValue> | undefined,
    isDefault: boolean,
    dirty: boolean | undefined
) => void
type ListenersMap<T extends ObjectOrArray> = {
    [TKey in KeyType<T>]?: ListenerIdMap<T, TKey>
}
type ListenerIdMap<
    T extends ObjectOrArray,
    U extends KeyType<T>,
    V extends T[U] = T[U]
> = {
    [key: string]: Listener<V>
}

type DirtyMap<T extends ObjectOrArray> = {
    [TKey in KeyType<T>]?: boolean
}

type State = {
    isSubmitting: boolean
}
// type StateListener = (state: State) => void
// type StateListenersMap = {
//     [key: string]: StateListener
// }

// type PartialDirtyMap<T extends ObjectOrArray> = {
//     [TKey in OnlyPropertiesOfType<T, ObjectOrArray>]?: boolean;
// };

// function copy<T extends ObjectOrArray>(obj: T): T {
//     if (Array.isArray(obj)) return [...(obj as any)] as any;
//     else if (typeof obj === "object") return { ...obj };
//     else throw new Error("copy was called for no reason");
// }

function deepCopy<T>(value: T): T {
    return JSON.parse(JSON.stringify(value))
}

export class FormState<T extends ObjectOrArray> {
    public values: T
    public dirty: DirtyMap<T> = {}
    public defaultValues: T
    public errors: ErrorMap<T> = {}
    public formId: number
    public state: State = { isSubmitting: false }
    public validate: (values: T) => ErrorMap<T> = () => ({})

    // private stateListeners: StateListenersMap = {};
    private listeners: ListenersMap<T> = {}
    private anyListeners: AnyListenersMap = {}
    private static currentId = 0

    constructor(values: T, defaultValues?: T) {
        if (defaultValues === undefined) {
            this.defaultValues = defaultValues ?? values
            this.values = deepCopy(values)
        } else {
            this.values = values
            this.defaultValues = defaultValues
        }
        this.formId = FormState.currentId++
    }

    public get isDirty(): boolean {
        return (
            Object.keys(this.dirty).some(
                (key) => this.dirty[key as KeyType<T>]
            ) ||
            Object.keys(this.values).length !==
                Object.keys(this.defaultValues).length
        )
    }

    public get anyError(): boolean {
        return Object.keys(this.errors).length > 0 //some((key) => this.errors[key as KeyType<T>])
    }

    public listen<U extends KeyType<T>, V extends T[U]>(
        key: U,
        listener: Listener<V>
    ): string {
        let setters = this.listeners[key]
        if (!setters) {
            setters = {}
            this.listeners[key] = setters
        }
        let id = '' + FormState.currentId++
        setters[id] = listener
        return id
    }

    public listenAny(listener: AnyListener) {
        let id = '' + FormState.currentId++
        this.anyListeners[id] = listener
        return id
    }

    public setState(state: State) {
        this.state = state
        this.fireAllNormalListeners(false)
        this.fireAnyListeners(false)
    }

    public reset(values?: T) {
        this.setValues(values ?? this.defaultValues, {}, true)
    }

    public ignoreAny(id: string) {
        delete this.anyListeners[id]
    }

    public ignore<U extends KeyType<T>>(key: U, id: string) {
        let setters = this.listeners[key]
        if (!setters) {
            console.warn('Ignore was called for no reason', key, id)
            return
        }
        delete setters[id]
    }

    /**
     * Sets a value on the form, will use the builtin validator. For manual validation, use setValueInternal.
     * @param key The field name to set.
     * @param value The new field value.
     */
    public setValue<U extends KeyType<T>, V extends T[U]>(key: U, value: V) {
        if (
            (value !== null && typeof value === 'object') ||
            Array.isArray(value)
        ) {
            console.warn(
                'Do not pass objects to setValue, use setValueInternal instead. When passing objects here, they will always be treated as dirty.'
            )
        }
        if (this.values[key] === value) return
        this.setValueInternal(key, value, this.defaultValues[key] !== value)
    }

    /**
     * Remove errors and dirty values for a field.
     * @param key The field name to remove errors and dirty for.
     */
    public unsetValue<U extends KeyType<T>>(key: U) {
        delete this.dirty[key]
        delete this.errors[key]
        this.fireListener(key)
        this.fireAnyListeners(false)
    }

    /**
     * Set a value the advanced way.
     * @param key The field name to set.
     * @param value The new value of the field.
     * @param dirty Is this field dirty?
     * @param error The error this field emits, leave undefined to use the forms validator, set null to signal no error.
     * @param skipId The field listener to skip.
     */
    public setValueInternal<U extends KeyType<T>, V extends T[U]>(
        key: U,
        value: V,
        dirty: boolean,
        error?: ErrorType<V> | null,
        skipId?: string
    ) {
        this.values[key] = value
        this.dirty[key] = dirty
        if (error !== undefined) {
            if (error === null || Object.keys(error).length === 0)
                delete this.errors[key]
            else this.errors[key] = error
        } else {
            this.errors = this.validate(this.values)
        }

        this.fireListener(key, false, skipId)
        this.fireAnyListeners(false, skipId)
    }

    /**
     * Sets errors for a form.
     * @param errors The errors to set in this form, leave undefined to use the forms validator. Will also trigger child and parent forms.
     * @param skipId The field listener to skip.
     */
    public setErrors(errors?: ErrorMap<T>, skipId?: string) {
        if (errors === undefined) errors = this.validate(this.values)
        if (
            Object.keys(this.errors).length === 0 &&
            Object.keys(errors).length === 0
        )
            return
        this.errors = errors

        this.fireAllNormalListeners(false, skipId)
        this.fireAnyListeners(true, skipId)
    }

    public setError<U extends KeyType<T>>(name: U, error: string) {
        if (this.errors[name] === error) return
        this.errors[name] = error as any
        this.fireAllNormalListeners(false)
        this.fireAnyListeners(true)
    }

    /**
     *
     * @param setValues The values to set in this form, will also notify parent and child forms.
     * @param errors The errors to set on this form, leave undefined to use the validator.
     * @param isDefault Are these values the default values of the form?
     * @param state The state of the form.
     * @param skipId The field listener to skip.
     */
    public setValues(
        setValues: T,
        errors?: ErrorMap<T>,
        isDefault?: boolean,
        state?: State,
        skipId?: string
    ) {
        if (errors === null) throw new Error('errors is null')
        if (setValues === undefined) throw new Error('setValues is undefined')
        if (isDefault) {
            this.defaultValues = setValues
            this.values = deepCopy(setValues)
            this.dirty = {}
        } else {
            this.values = setValues
        }
        if (errors !== undefined) this.errors = errors
        else this.errors = this.validate(this.values)
        if (state !== undefined) this.state = state

        if (!this.values) return
        this.fireAllNormalListeners(isDefault, skipId)
        this.recalculateDirty()
        this.fireAnyListeners(true, skipId)
    }

    private recalculateDirty() {
        // Recalculate dirty values
        let keys = Object.keys(this.values)
        for (let i = 0; i < keys.length; i++) {
            let name = keys[i] as KeyType<T>
            let value = this.values[name]
            if (typeof value === 'object' || Array.isArray(value)) continue // do not
            this.dirty[name] = this.defaultValues[name] !== value
        }
    }

    private fireListener<U extends KeyType<T>>(
        key: U,
        isDefault?: boolean,
        skipId?: string
    ) {
        let listeners = this.listeners[key]
        if (listeners) {
            // Call all listeners for the set field
            let value = this.values[key]
            let dirty = this.dirty[key]
            let error = this.errors[key]
            Object.keys(listeners!).forEach((id) => {
                if (id !== skipId)
                    listeners![id](value, error, isDefault ?? false, dirty)
            })
        }
    }

    private fireAllNormalListeners(isDefault?: boolean, skipId?: string) {
        // Call all listeners for each set field
        Object.keys(this.values).forEach((keyString) => {
            this.fireListener(keyString as KeyType<T>, isDefault, skipId)
        })
    }

    private fireAnyListeners(setValuesWasUsed: boolean, skipId?: string) {
        // Call all listeners that listen for any change
        Object.keys(this.anyListeners).forEach((id) => {
            if (id !== skipId) this.anyListeners[id](setValuesWasUsed)
        })
    }
}

export type AnyListenerProps<T extends ObjectOrArray> = {
    form: FormState<T>
    onlyOnSetValues?: boolean
    render: (props: {
        values: T
        errors: ErrorMap<T>
        dirty: DirtyMap<T>
        isDirty: boolean
        anyError: boolean
        isSubmitting: boolean
        setValues: (values: T) => void
    }) => React.ReactNode
}

export function AnyListener<T extends ObjectOrArray>(
    props: AnyListenerProps<T>
) {
    const form = props.form
    const [, setRender] = useState(0)

    useEffect(() => {
        let id = form.listenAny((setValuesWasUsed) => {
            if (!props.onlyOnSetValues || setValuesWasUsed)
                setRender((r) => r + 1)
        })
        return () => form.ignoreAny(id)
    }, [form, props.onlyOnSetValues])

    return (
        <>
            {props.render({
                errors: form.errors,
                dirty: form.dirty,
                values: form.values,
                isDirty: form.isDirty,
                anyError: form.anyError,
                isSubmitting: form.state.isSubmitting,
                setValues: (newValues) => form.setValues(newValues)
            })}
        </>
    )
}

export type UseFormValues<TValue> = {
    value: TValue
    error?: ErrorType<TValue>
    dirty?: boolean
    isSubmitting: boolean
    setValue: (value: TValue) => void
}

export function useFormValue<
    T extends ObjectOrArray,
    TKey extends KeyType<T>,
    TValue extends T[TKey]
>(form: FormState<T>, name: TKey): UseFormValues<TValue> {
    const [value, setValue] = useState(() => ({
        value: form.values[name],
        error: form.errors[name],
        dirty: form.dirty[name],
        isSubmitting: form.state.isSubmitting,
        setValue: (value: TValue) => form.setValue(name, value)
    }))

    useEffect(() => {
        let id = form.listen(name, (value, error, dirty) =>
            setValue({
                value,
                error,
                dirty,
                isSubmitting: form.state.isSubmitting,
                setValue: (value: TValue) => form.setValue(name, value)
            })
        )
        return () => form.ignore(name, id)
    }, [form, name])

    return value
}

export type ListenerProps<
    T extends ObjectOrArray,
    TKey extends KeyType<T>,
    TValue extends T[TKey]
> = {
    form: FormState<T>
    name: TKey
    render: (props: {
        value: TValue
        dirty?: boolean
        error?: ErrorType<TValue>
        isSubmitting: boolean
        setValue: (value: TValue) => void
    }) => React.ReactNode
}

export function Listener<
    T extends ObjectOrArray,
    TKey extends KeyType<T>,
    TValue extends T[TKey]
>(props: ListenerProps<T, TKey, TValue>) {
    const form = props.form
    const [, setRender] = useState(0)

    useEffect(() => {
        let id = form.listen(props.name, () => setRender((r) => r + 1))
        return () => form.ignore(props.name, id)
    }, [form, props.name])

    return (
        <>
            {props.render({
                dirty: form.dirty[props.name],
                error: form.errors[props.name],
                value: form.values[props.name],
                isSubmitting: form.state.isSubmitting,
                setValue: (value) => form.setValue(props.name, value)
            })}
        </>
    )
}

export type MultiListenerProps<
    T extends ObjectOrArray,
    TKeys extends KeyType<T>[]
> = {
    form: FormState<T>
    names: TKeys
    render: (props: {
        values: KeyTypes<T, TKeys>
        errors: KeyTypes<ErrorMap<T>, TKeys>
        dirty: KeyTypes<DirtyMap<T>, TKeys>
        isSubmitting: boolean
        setValues: (values: Partial<T>) => void
    }) => React.ReactNode
}

export function MultiListener<
    T extends ObjectOrArray,
    TKeys extends KeyType<T>[]
>(props: MultiListenerProps<T, TKeys>) {
    const form = props.form
    const [, setRender] = useState(0)

    useEffect(() => {
        let ids = props.names.map((name) =>
            form.listen(name, () => setRender((r) => r + 1))
        )
        return () => ids.forEach((id, i) => form.ignore(props.names[i], id))
    }, [form]) // props.names

    return (
        <>
            {props.render({
                values: form.values,
                errors: form.errors,
                dirty: form.dirty,
                isSubmitting: form.state.isSubmitting,
                setValues: (newValues) => {
                    Object.keys(newValues).forEach((keyString) => {
                        let key = keyString as KeyType<T>
                        form.setValue(key, newValues[key]!)
                    })
                }
            })}
        </>
    )
}

export type FormProps<T extends ObjectOrArray> = {
    values: T
    render: (form: FormState<T>) => React.ReactNode
}

export function Form<T extends ObjectOrArray>(props: FormProps<T>) {
    const form = useForm(props.values)
    return props.render(form)
}

export type ChildFormProps<
    TParent extends ObjectOrArray,
    TKey extends KeyType<TParent>,
    TValue extends TParent[TKey]
> = {
    parent: FormState<TParent>
    name: TKey
    render: (form: FormState<TValue>) => JSX.Element
}

export function ChildForm<
    TParent extends ObjectOrArray,
    TKey extends KeyType<TParent>,
    TValue extends TParent[TKey]
>(props: ChildFormProps<TParent, TKey, TValue>) {
    const childForm = useChildForm(props.parent, props.name)
    return props.render(childForm)
}

export function useForm<T>(values: T) {
    let ref = useRef(new FormState<T>(deepCopy(values), values))

    useEffect(() => {
        ref.current.setValues(values, {}, true)
    }, [values])

    return ref.current
}

export function useChildForm<
    TParent extends ObjectOrArray,
    TKey extends KeyType<TParent>,
    TValue extends TParent[TKey]
>(parent: FormState<TParent>, name: TKey) {
    let ref = useRef(
        new FormState<TValue>(
            deepCopy(parent.values[name]),
            parent.defaultValues[name]
        )
    )

    useEffect(() => {
        ref.current.setValues(
            deepCopy(parent.values[name]),
            parent.errors[name] as any
        )
        let parentId = parent.listen(name, (val, errors, isDefault) => {
            ref.current.setValues(
                val,
                (errors as any) ?? {},
                isDefault,
                parent.state,
                id
            )
        })
        let id = ref.current.listenAny(() => {
            parent.setValueInternal(
                name,
                ref.current.values,
                ref.current.isDirty,
                ref.current.errors as any,
                parentId
            )
        })
        let i = ref.current
        return () => {
            i.ignoreAny(id)
            parent.ignore(name, parentId)
            parent.unsetValue(name)
        }
    }, [parent, name])

    return ref.current
}

export function yupValidator<T>(
    schema: any,
    transform: (message: any) => any = (s) => s
) {
    return (values: T) => {
        try {
            schema.validateSync(values, { abortEarly: false })
            return {}
        } catch (ex) {
            return yupErrorsToErrorMap(ex.inner, transform)
        }
    }
}

export function yupErrorsToErrorMap(
    errors: any[],
    transform: (message: any) => any = (s) => s
) {
    let obj = {} as any
    for (let i = 0; i < errors.length; i++) {
        let err = errors[i]
        let pathSegments = [...err.path.matchAll(/(\w+)/gi)].map((e) => e[0])
        let o = obj
        for (let j = 0; j < pathSegments.length; j++) {
            let key = pathSegments[j]
            let oo = o[key]
            if (!oo) {
                oo = {}
                o[key] = oo
            }
            if (j === pathSegments.length - 1) {
                o[key] = transform(err.message)
            } else {
                o = oo
            }
        }
    }
    return obj
}

export type ErrorFieldProps<T extends ObjectOrArray> = {
    form: FormState<T>
    name: KeyType<T>
    as: (props: { children: React.ReactNode }) => JSX.Element
}

export function ErrorField<T extends ObjectOrArray>(props: ErrorFieldProps<T>) {
    const { error } = useFormValue(props.form, props.name)
    if (!error) return null
    return props.as({ children: error })
}

// export type InputProps<
//     T extends ObjectOrArray,
//     TKey extends KeyType<T>,
//     TInput extends HTMLInputElement | HTMLTextAreaElement
// > = Omit<HTMLProps<TInput>, "form" | "as"> & {
//     form: FormState<T>;
//     name: TKey;
//     as: (props: {
//         value: any;
//         dirty?: boolean;
//         error?: ErrorType<T[TKey]>;
//         onChange: (ev: React.ChangeEvent<TInput>) => void;
//     }) => JSX.Element | null;
//     transformValue?: (ev: React.ChangeEvent<TInput>) => T[TKey];
// };

// export function InputField<T extends ObjectOrArray, TKey extends KeyType<T>, TInput extends HTMLInputElement>(
//     props: InputProps<T, TKey, TInput>
// ) {
//     const { transformValue, name, form, as, ...rest } = props;
//     const setter = useCallback(
//         (ev: React.ChangeEvent<TInput>) => {
//             form.setValue(name, transformValue ? transformValue(ev) : (ev.target.value as any));
//         },
//         [transformValue]
//     );
//     const { value, dirty, error } = useFormValue(form, name);
//     return <props.as value={value} error={error} dirty={dirty} onChange={setter} {...rest} />;
// }

export type ArrayFieldProps<
    TParent extends ObjectOrArray,
    TKey extends KeyType<OnlyPropertiesOfType<TParent, any[]>>,
    T extends TParent[TKey]
> = {
    parent: FormState<TParent>
    name: TKey
    render: (props: {
        form: FormState<T>
        values: T
        setValues: (values: T) => void
        remove: (index: number) => void
        clear: () => void
        move: (index: number, newIndex: number) => void
        swap: (index: number, newIndex: number) => void
        append: (value: T[number]) => void
    }) => React.ReactNode
}

export function ArrayField<
    TParent extends ObjectOrArray,
    TKey extends KeyType<OnlyPropertiesOfType<TParent, any[]>>,
    T extends TParent[TKey]
>(props: ArrayFieldProps<TParent, TKey, T>) {
    const form = useChildForm<OnlyPropertiesOfType<TParent, any[]>, TKey, T>(
        props.parent,
        props.name
    )

    function append(value: T[number]) {
        form.setValues([...form.values, value] as any)
    }

    function remove(index: number) {
        let newValues = [...form.values]
        newValues.splice(index, 1)
        let newErrors = { ...form.errors }
        delete (newErrors as any)[index]
        form.setValues(newValues as any, newErrors)
    }

    function clear() {
        form.setValues([] as any, {})
    }

    function move(index: number, newIndex: number) {
        throw new Error('Move not implemented.')
        if (index === newIndex) return
        let values = [...form.values]
        values.splice(newIndex, 0, values.splice(index, 1)[0])
        let errors = { ...form.errors } as any
        if (newIndex > index) {
            let e = errors[index]
            for (let i = index; i < newIndex; i++) {
                errors[i] = errors[i + 1]
            }
            errors[newIndex] = e
        } else {
            let e = errors[index]
            for (let i = newIndex; i > index; i--) {
                errors[i] = errors[i - 1]
            }
            errors[newIndex] = e
        }
        form.setValues(values as any, errors)
    }

    function swap(index: number, newIndex: number) {
        let values = [...form.values]
        ;[values[index], values[newIndex]] = [values[newIndex], values[index]]
        let errors = { ...form.errors } as any
        ;[errors[index], errors[newIndex]] = [errors[newIndex], errors[index]]
        form.setValues(values as any, errors)
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
    )
}
