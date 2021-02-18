import { useRef, useEffect, useState } from "react";
import { DefaultState, DefaultError, FormState, ChildFormState, Validator } from "./form";

/**
 * Creates a new root form.
 * This hook doesn't cause a rerender.
 * @param defaultValues The default values for this form.
 * @param defaultState The default state for this form. Form state contains custom global states, example: isSubmitting, isLoading ...
 * @param validator The validator to use, optional.
 * @param validateOnChange Validate on change?
 */
export function useForm<T, State = DefaultState, Error = DefaultError>(
    defaultValues: T,
    defaultState: State = { isSubmitting: false } as any,
    validator?: Validator<T, Error>,
    validateOnMount = false,
    validateOnChange = true
) {
    let c = useRef<FormState<T, State, Error> | null>(null);

    if (!c.current) {
        c.current = new FormState(defaultValues, defaultValues, defaultState, validator, validateOnMount, validateOnChange);
    }

    useEffect(() => {
        c.current!.setValues(defaultValues, c.current!.validateOnMount, true);
    }, [defaultValues]);

    return c.current;
}

/**
 * Creates a nested form for another root or nested form. You must use this for object and array (see useArrayForm) field.
 * This hook doesn't cause a rerender.
 * @param parentForm The parent form.
 * @param name The parent's field to create a child form for.
 */
export function useChildForm<T, State, Error, Key extends keyof T>(parentForm: FormState<T, State, Error>, name: Key) {
    let c = useRef<ChildFormState<T, State, Error, Key> | null>(null);
    if (!c.current) {
        c.current = new ChildFormState(parentForm, name);
    }

    useEffect(() => {
        // Update parent and child form
        parentForm.childMap[name] = c.current!;
        c.current!.name = name;

        // Set new default values, without notifying children
        c.current!.setValues(parentForm.defaultValues[name] ?? ({} as any), false, true, false, false);
        // Then, set new values and notify children
        c.current!.setValues(parentForm.values[name] ?? ({} as any), c.current!.validateOnMount, false, true, false);

        return () => {
            // Could already be overriden (useEffect ordering)
            if (parentForm.childMap[name] === c.current!) {
                delete parentForm.childMap[name];
                delete parentForm.errorMap[name];
                delete parentForm.dirtyMap[name];
            }
        };
    }, [parentForm, name]);

    return c.current;
}

/**
 * Listen for changes on a form's field. Behaves like useState.
 * You shouldn't use this hook in large components, as it rerenders each time something changes. Use the wrapper <Listener /> instead.
 * @param form The form to listen on.
 * @param name The form's field to listen to.
 */
export function useListener<T, State, Error, Key extends keyof T>(form: FormState<T, State, Error>, name: Key) {
    const [, setRender] = useState(0);

    useEffect(() => {
        let id = form.listen(name, () => {
            setRender((e) => e + 1);
        });
        return () => form.ignore(name, id);
    }, [form, name]);

    return {
        value: form.values[name],
        defaultValue: form.defaultValues[name],
        setValue: (value: T[Key]) => form.setValue(name, value),
        dirty: form.dirtyMap[name],
        error: form.errorMap[name],
        state: form.state,
        form
    };
}

/**
 * Listens for any change on this form. Behaves like useState.
 * You shouldn't use this hook in large components, as it rerenders each time something changes. Use the wrapper <AnyListener /> instead.
 * @param form The form to listen to.
 */
export function useAnyListener<T, State, Error>(form: FormState<T, State, Error>) {
    const [, setRender] = useState(0);

    useEffect(() => {
        let id = form.listenAny(() => {
            setRender((e) => e + 1);
        });
        return () => form.ignoreAny(id);
    }, [form]);

    return form;
}

function append<T, Key extends keyof T>(this: FormState<T, any, any>, value: NonNullable<T[Key]>[keyof NonNullable<T[Key]>]) {
    this.setValues([...(this.values as any), value] as any);
}

function remove(this: FormState<any, any, any>, index: number) {
    let newValues = [...this.values];
    newValues.splice(index, 1);
    this.setValues(newValues);
}

function clear(this: FormState<any, any, any>) {
    this.setValues([]);
}

function move(this: FormState<any, any, any>, from: number, to: number) {
    if (to === from) return;
    let newArr = [...this.values];
    var target = newArr[from];
    var increment = to < from ? -1 : 1;
    for (var k = from; k !== to; k += increment) {
        newArr[k] = newArr[k + increment];
    }
    newArr[to] = target;
    this.setValues(newArr);
}

function swap(this: FormState<any, any, any>, index: number, newIndex: number) {
    if (index === newIndex) {
        return;
    }
    let values = [...this.values];
    [values[index], values[newIndex]] = [values[newIndex], values[index]];
    this.setValues(values);
}

/**
 * This is a wrapper around useChildForm, with useful functions to manipulate arrays.
 * This hook does cause a rerender, but only if the array size changes.
 * @param parentForm The parent form.
 * @param name The parent's field to create a child form for.
 */
export function useArrayForm<Parent, ParentState, ParentError, Key extends keyof Parent>(
    parentForm: FormState<Parent, ParentState, ParentError>,
    name: Key
) {
    const form = useChildForm<Parent, ParentState, ParentError, Key>(parentForm, name);
    const oldLength = useRef(-1);
    const [, setRender] = useState(0);

    // Only rerender when array size changed
    useEffect(() => {
        let id = parentForm.listen(name, () => {
            let val = parentForm.values[name] as any;
            if (val.length !== oldLength.current) {
                setRender((i) => i + 1);
                oldLength.current = val.length;
            }
        });
        return () => parentForm.ignore(name, id);
    }, []);

    return {
        remove: remove.bind(form),
        move: move.bind(form),
        swap: swap.bind(form),
        clear: clear.bind(form),
        append: append.bind(form),
        form: form,
        values: form.values,
        setValues: form.setValues.bind(form)
    };
}
