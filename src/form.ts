export type ListenerCallback = (setValuesWasUsed: boolean) => void;
export type ListenerMap = { [T in string]?: ListenerCallback };
export type Validator<T, Error> = (values: T) => ErrorMap<T, Error>;

export type ChildFormMap<T, State, Error> = {
    [Key in keyof T]?: ChildFormState<T, State, Error, Key>;
};

export type DirtyMap<T> = {
    [Key in keyof T]?: boolean;
};

type ObjectOrArray = {
    [key: string]: any;
    [key: number]: any;
};

export type ErrorType<T, Error> = T extends ObjectOrArray ? ErrorMap<T, Error> : Error;

export type ErrorMap<T, Error> = {
    [Key in keyof T]?: ErrorType<T[Key], Error>;
};

export type DefaultError = string;
export type DefaultState = { isSubmitting: boolean };

export function memberCopy<T>(value: T): T {
    if (Array.isArray(value)) {
        return [...value] as any;
    } else if (typeof value === "object") {
        return { ...value };
    } else {
        throw new Error("Can only memberCopy() arrays and objects.");
    }
}

/**
 * Compares 2 objects that only contain primitive fields (no object fields)
 * @returns true when different, false when 'equal', undefined when an object field was found.
 */
export function comparePrimitiveObject<T>(a: T, b: T): boolean | undefined {
    let ak = Object.keys(a),
        bk = Object.keys(b);
    let lk = ak.length > bk.length ? ak : bk;
    for (let i = 0; i < lk.length; i++) {
        let k = lk[i];
        let av = a[k],
            bv = b[k];
        if ((typeof av === "object" && av !== null) || (typeof bv === "object" && bv !== null)) return undefined;
        if (av !== bv) return true;
    }
    return false;
}

export class FormState<T, State = DefaultState, Error = DefaultError> {
    /**
     * The id of this form, for debugging purposes.
     */
    public readonly formId = ++FormState.formCounter;

    /**
     * The form's validator.
     */
    public validator?: Validator<T, Error>;

    /**
     * Should the form validate on each value change?
     */
    public validateOnChange: boolean;

    /**
     * The values on this form. Use setValues() to set these.
     */
    public readonly values: T;

    /**
     * The default values on this form. Use setValues(..., true) to set these.
     */
    public readonly defaultValues: T;

    /**
     * The dictionary that maps object fields to child forms.
     */
    public readonly childMap: ChildFormMap<T, State, Error> = {};

    /**
     * The dictionary that contains dirty states for each field.
     */
    public readonly dirtyMap: DirtyMap<T> = {};

    /**
     * The dictionary that contains errors for each field.
     */
    public readonly errorMap: ErrorMap<T, Error> = {};

    private _state: State;
    private listeners: { [Key in keyof T]?: ListenerMap } = {};
    private anyListeners: ListenerMap = {};
    private counter = 0;
    private static formCounter = 0;

    public constructor(values: T, defaultValues: T, defaultState: State, validator?: Validator<T, Error>, validateOnChange = true) {
        this.values = memberCopy(values);
        this.defaultValues = memberCopy(defaultValues);
        this._state = memberCopy(defaultState);
        this.validator = validator;
        this.validateOnChange = validateOnChange;
    }

    /**
     * Gets the state of the current form.
     */
    public get state() {
        return this._state;
    }

    /**
     * Is this form modified?
     */
    public get dirty() {
        return Object.keys(this.dirtyMap).some((e) => this.dirtyMap[e]);
    }

    /**
     * Does this form contain any error?
     */
    public get error() {
        return Object.keys(this.errorMap).some((e) => this.errorMap[e]);
    }

    /**
     * Sets a value the advanced way.
     * @param key The field to set.
     * @param value The value to set in the field.
     * @param dirty Is this field dirty? Leave undefined to not set any dirty value. (can always be overridden by child forms)
     * @param validate Should the form validate after value set? This does not override `validateOnChange`.
     * @param isDefault Is this the default value for the said field?
     * @param notifyChild Should this form notify any child form about the change?
     * @param notifyParent Should this form notify any parent form about the change?
     * @param fireAny Fire all `anyListeners` after field is set? You should not touch this. (will be false for bulk sets, they will call fireAnyListeners() after every field is set)
     */
    public setValueInternal<Key extends keyof T>(
        key: Key,
        value: T[Key] | undefined,
        dirty: boolean,
        validate: boolean = true,
        isDefault: boolean = false,
        notifyChild: boolean = true,
        notifyParent: boolean = true,
        fireAny: boolean = true
    ) {
        let valueMap = isDefault ? this.defaultValues : this.values;
        if (value === undefined) {
            if (Array.isArray(valueMap)) valueMap.splice(key as number, 1);
            else delete valueMap[key];
        } else {
            valueMap[key] = value;
        }

        this.dirtyMap[key] = dirty;

        if (notifyChild && value !== undefined) {
            let child = this.childMap[key];
            if (child) {
                child.setValues(value, true, isDefault, true, false);
                this.dirtyMap[key] = child.dirty;
            }
        }

        this.fireListeners(key, false);
        if (fireAny) {
            // Will be false when using setValues, he will call fireAnyListeners and notifyParentValues itself
            if (notifyParent) this.updateParentValues(isDefault); // Will call setValueInternal on parent
            this.fireAnyListeners(false);
        }

        if (validate && this.validateOnChange && this.validator) this.validate();
    }

    /**
     * Set a value on this form.
     * @param key The field to set.
     * @param value The field's new value.
     * @param validate Should the form validate?
     * @param isDefault Is this the default value?
     * @param notifyChild Should this form notify the child form about this change?
     * @param notifyParent Should this form notify the parent form about this change?
     * @param fireAny Fire all `anyListeners` after field is set? You should not touch this. (will be false for bulk sets, they will call fireAnyListeners() after every field is set)
     */
    public setValue<Key extends keyof T>(
        key: Key,
        value: T[Key] | undefined,
        validate: boolean = true,
        isDefault: boolean = false,
        notifyChild: boolean = true,
        notifyParent: boolean = true,
        fireAny: boolean = true
    ) {
        if (typeof value === "object" && value !== null) {
            // Do not compare objects, child form should mark dirty
            let dirty: boolean | undefined = false;
            if (fireAny) {
                // Compare value against defaultValues when !isDefault else compare against values (is not switched!!)
                if (value instanceof Date) {
                    dirty = value?.getTime() !== (isDefault ? this.values[key] : (this.defaultValues[key] as any))?.getTime();
                } else {
                    dirty = comparePrimitiveObject(value, isDefault ? this.values[key] : this.defaultValues[key]);
                    if (dirty === undefined) {
                        console.warn("Do not use setValue for object in object fields, use setValueInternal instead (dirty value can not be determined), ", key, value);
                        dirty = true;
                    }
                }
            }
            this.setValueInternal(key, value, dirty, validate, isDefault, notifyChild, notifyParent, fireAny);
        } else {
            // Calculate and compare value types, determine dirty?
            if ((isDefault && this.defaultValues[key] === value) || (!isDefault && this.values[key] === value)) return false;
            this.setValueInternal(key, value, isDefault ? value !== this.values[key] : value !== this.defaultValues[key], validate, isDefault, notifyChild, notifyParent, fireAny);
        }
        return true;
    }

    /**
     * Set all values on this form.
     * @param values The new values to set on this form.
     * @param validate Validate? Does not override `validateOnChange`.
     * @param isDefault Are these values the default values for this form?
     * @param notifyChild Should this form notify the child form about this change?
     * @param notifyParent Should this form notify the parent form about this change?
     */
    public setValues(values: T, validate: boolean = true, isDefault: boolean = false, notifyChild: boolean = true, notifyParent: boolean = true) {
        // Copy the values to the local form object
        let newKeys = Object.keys(isDefault ? this.defaultValues : this.values);
        let localKeys = Object.keys(values);
        let mostKeys = newKeys.length > localKeys.length ? newKeys : localKeys;
        for (let i = 0; i < mostKeys.length; i++) {
            let key = mostKeys[i] as keyof T;
            this.setValue(
                key,
                values[key],
                false, // Will validate after all values are copied
                isDefault,
                notifyChild,
                notifyParent,
                false // Will call fireAnyListener after all values are copied, see 3 lines down
            );
        }
        if (notifyParent) this.updateParentValues(isDefault);
        this.fireAnyListeners(true);

        if (validate && this.validateOnChange && this.validator) this.validate();
    }

    /**
     * Set default values for this form. (Convenience wrapper around `setValues()`)
     * @param values The new default values to set on this form.
     * @param validate Validate?
     * @param notifyChild Should this form notify the child form about this change?
     * @param notifyParent Should this form notify the parent form about this change?
     */
    public setDefaultValues(values: T, validate: boolean = true, notifyChild: boolean = true, notifyParent: boolean = true) {
        this.setValues(values, validate, true, notifyChild, notifyParent);
    }

    /**
     * Force validation on this field. Required when `validateOnChange` is disabled.
     */
    public validate() {
        if (!this.validator) {
            console.warn("validate() was called on a form which does not have a validator set.");
            return;
        }
        this.setErrors(this.validator(this.values));
    }

    /**
     * Sets an error on this form
     * @param key The field to set an error on.
     * @param error The error.
     * @param notifyChild Should this form notify the child form about this change?
     * @param notifyParent Should this form notify the parent form about this change?
     * @param fireAny
     */
    public setError<Key extends keyof T>(
        key: Key,
        error: ErrorType<T[Key], Error> | undefined,
        notifyChild: boolean = true,
        notifyParent: boolean = true,
        fireAny: boolean = true
    ) {
        if (this.errorMap[key] === error) return;

        if (!error) delete this.errorMap[key];
        else this.errorMap[key] = error;

        if (notifyChild) this.childMap[key]?.setErrors((error ?? {}) as any);
        this.fireListeners(key, false);
        if (fireAny) {
            if (notifyParent) this.updateParentErrors(); // Will call setError on parent
            this.fireAnyListeners(false);
        }
    }

    /**
     * Sets all the errors on this form.
     * @param errors The new errors for this form. Use {} to clear errors. **The format of this error object must follow the same structure of the values object, but each value is replaced by its error.**
     * @param notifyChild Should this form notify the child form about this change?
     * @param notifyParent Should this form notify the parent form about this change?
     */
    public setErrors(errors: ErrorMap<T, Error>, notifyChild: boolean = true, notifyParent: boolean = true) {
        let localKeys = Object.keys(this.errorMap);
        let newKeys = Object.keys(errors);
        let mostKeys = newKeys.length > localKeys.length ? newKeys : localKeys;
        for (let i = 0; i < mostKeys.length; i++) {
            let key = mostKeys[i] as keyof T;
            this.setError(
                key,
                errors[key] as any,
                notifyChild,
                notifyParent,
                false // Will call fireAnyListener by itself, see 3 lines down
            );
        }
        if (notifyParent) this.updateParentErrors();
        this.fireAnyListeners(false);
    }

    /**
     * Reset this form's values to the default values.
     */
    public resetAll() {
        this.setValues(this.defaultValues);
    }

    /**
     * Reset a form's field to its default value.
     * @param key The field to reset.
     */
    public reset(key: keyof T) {
        this.setValue(key, this.defaultValues[key]);
    }

    /**
     * Sets the state for this form, and also on child and parent forms by default.
     * @param state The new form state.
     * @param notifyChild Set the state on the child too?
     * @param notifyParent Set the state on the parent too?
     */
    public setState(state: State, notifyChild: boolean = true, notifyParent: boolean = true) {
        this._state = state;

        let c = Object.keys(this.values);
        if (notifyChild) c.forEach((e) => this.childMap[e]?.setState(state, notifyChild, notifyParent));

        c.forEach((e) => this.fireListeners(e as keyof T, false));
        if (notifyParent) this.updateParentState();
        this.fireAnyListeners(false);
    }

    /**
     * Listen for changes on a field, will trigger when value, defaultValue, dirty and error changes for a field. Make sure you pass its return value back to `ignore()` after you are done listening.
     * @param key The field to listen to.
     * @param listener Change callback.
     */
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

    /**
     * Listen for any change on this form. Make sure you pass its return value back to `ignoreAny()` after you are done listening.
     * @param listener Change callback.
     */
    public listenAny(listener: ListenerCallback) {
        if (!this.anyListeners) this.anyListeners = {};
        let id = "" + this.counter++;
        this.anyListeners[id] = listener;
        return id;
    }

    /**
     * Ignore changes on a field.
     * @param key The field to ignore.
     * @param id The callback to ignore.
     */
    public ignore(key: keyof T, id: string) {
        if (!this.listeners) return;
        let setters = this.listeners[key];
        if (!setters) {
            console.warn("Ignore was called for no reason", key, id);
            return;
        }
        delete setters[id];
    }

    /**
     * Ignore changes on this form.
     * @param id The callback to ignore.
     */
    public ignoreAny(id: string) {
        if (!this.anyListeners) return;
        delete this.anyListeners[id];
    }

    protected fireListeners(key: keyof T, setValuesWasUsed: boolean) {
        let a = this.listeners[key];
        if (a) {
            let l = Object.keys(a!);
            l.forEach((e) => a![e]!(setValuesWasUsed));
        }
    }

    protected fireAnyListeners(setValuesWasUsed: boolean) {
        let al = Object.keys(this.anyListeners);
        al.forEach((e) => this.anyListeners[e]!(setValuesWasUsed));
    }

    protected updateParentValues(_isDefault: boolean) {
        // Not implemented for root form, as it does not have a parent
    }

    protected updateParentErrors() {
        // Not implemented for root form, as it does not have a parent
    }

    protected updateParentState() {
        // Not implemented for root form, as it does not have a parent
    }
}

export class ChildFormState<Parent, ParentState, ParentError, Key extends keyof Parent> extends FormState<Parent[Key], ParentState, ParentError> {
    public name: Key;
    public readonly parent: FormState<Parent, ParentState, ParentError>;

    public constructor(parent: FormState<Parent, ParentState, ParentError>, name: Key) {
        super(parent.values[name] ?? ({} as any), parent.defaultValues[name] ?? ({} as any), parent.state);
        this.parent = parent;
        this.name = name;
    }

    protected updateParentValues(isDefault: boolean) {
        this.parent.setValueInternal(this.name, isDefault ? memberCopy(this.defaultValues) : memberCopy(this.values), this.dirty, true, isDefault, false, true, true);
    }

    protected updateParentErrors() {
        this.parent.setError(this.name, this.error ? (memberCopy(this.errorMap) as any) : undefined, false, true);
    }

    protected updateParentState() {
        this.parent.setState(memberCopy(this.state), false, true);
    }
}
