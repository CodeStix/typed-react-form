import { useRef, useEffect, useState, useCallback } from "react";
import { DefaultState, DefaultError, FormState, ChildFormState, Validator } from "./form";

/**
 * Creates a new root form.
 * This hook doesn't cause a rerender.
 * @param defaultValues The default values for this form.
 * @param validator The validator to use, optional.
 * @param validateOnChange Validate on change? Optional, default is false.
 * @param validateOnMount Validate on mount? Optional, default is false.
 * @param defaultState The default state for this form. Form state contains custom global states, example: isSubmitting, isLoading ... Optional, default is `{ isSubmitting: false }`.
 */
export function useForm<T, State = DefaultState, Error extends string = DefaultError>(
    defaultValues: T,
    validator?: Validator<T, Error>,
    validateOnChange = false,
    validateOnMount = false,
    defaultState?: State
) {
    let c = useRef<FormState<T, State, Error> | null>(null);

    if (!c.current) {
        c.current = new FormState(
            defaultValues,
            defaultValues,
            defaultState ?? ({ isSubmitting: false } as any),
            validator,
            validateOnMount,
            validateOnChange
        );
    }

    useEffect(() => {
        c.current!.setDefaultValues(defaultValues, c.current!.validateOnMount, true, false);
    }, [defaultValues]);

    return c.current;
}

/**
 * Creates a nested form for another root or nested form. You must use this for object and array (see useArrayForm) field.
 * This hook doesn't cause a rerender.
 * @param parentForm The parent form.
 * @param name The parent's field to create a child form for.
 */
export function useChildForm<T, Key extends keyof T, State = DefaultState, Error extends string = DefaultError>(
    parentForm: FormState<T, State, Error>,
    name: Key
) {
    let c = useRef<ChildFormState<T, Key, State, Error> | null>(null);
    if (!c.current) {
        c.current = new ChildFormState(parentForm, name);
    }

    useEffect(() => {
        // Update parent and child form
        parentForm.childMap[name] = c.current!;
        c.current!.name = name;

        // First, set new default values, without validating
        c.current!.setValues(parentForm.defaultValues[name] ?? ({} as any), false, true, true, false);
        // Then, set new values and validate if needed
        c.current!.setValues(parentForm.values[name] ?? ({} as any), c.current!.validateOnMount, false, true, true);

        return () => {
            // Only clear if is not already overwritten
            if (parentForm.childMap[name] === c.current!) {
                delete parentForm.childMap[name];
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
export function useListener<T, Key extends keyof T, State = DefaultState, Error extends string = DefaultError>(
    form: FormState<T, State, Error>,
    name: Key
) {
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
export function useAnyListener<T, State = DefaultState, Error extends string = DefaultError>(form: FormState<T, State, Error>) {
    const [, setRender] = useState(0);

    useEffect(() => {
        let id = form.listenAny(() => {
            setRender((e) => e + 1);
        });
        return () => form.ignoreAny(id);
    }, [form]);

    return form;
}

/**
 * This is a wrapper around useChildForm, with useful functions to manipulate arrays.
 * This hook does cause a rerender, but only if the array size changes.
 * @param parentForm The parent form.
 * @param name The parent's field to create a child form for.
 */
export function useArrayForm<Parent, Key extends keyof Parent, ParentState = DefaultState, ParentError extends string = DefaultError>(
    parentForm: FormState<Parent, ParentState, ParentError>,
    name: Key
) {
    const form = useChildForm(parentForm, name);
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

    const append = useCallback((value: NonNullable<Parent[Key]>[any]) => {
        form.setValues([...(form.values as any), value] as any);
    }, []);

    const remove = useCallback((index: number) => {
        let newValues = [...(form.values as any)];
        newValues.splice(index, 1);
        form.setValues(newValues as any);
    }, []);

    const clear = useCallback(() => {
        form.setValues([] as any);
    }, []);

    const move = useCallback((from: number, to: number) => {
        if (to === from) return;
        let newArr = [...(form.values as any)];
        var target = newArr[from];
        var increment = to < from ? -1 : 1;
        for (var k = from; k !== to; k += increment) {
            newArr[k] = newArr[k + increment];
        }
        newArr[to] = target;
        form.setValues(newArr as any);
    }, []);

    const swap = useCallback((index: number, newIndex: number) => {
        if (index === newIndex) {
            return;
        }
        let values = [...(form.values as any)];
        [values[index], values[newIndex]] = [values[newIndex], values[index]];
        form.setValues(values as any);
    }, []);

    return {
        remove: remove,
        move: move,
        swap: swap,
        clear: clear,
        append: append,
        form: form,
        values: form.values,
        setValues: form.setValues.bind(form)
    };
}

/**
 * Listen for truthy changes (if a value becomes truthy or falsy) on a form's field. Behaves like useState.
 * @param form The form to listen on.
 * @param name The form's field to listen to.
 */
export function useTruthyListener<T, Key extends keyof T, State = DefaultState, Error extends string = DefaultError>(
    form: FormState<T, State, Error>,
    name: Key
) {
    const oldTruthy = useRef(!!form.values[name]);
    const [, setRender] = useState(0);

    useEffect(() => {
        let id = form.listen(name, () => {
            let thruthly = !!form.values[name];
            if (thruthly !== oldTruthy.current) {
                setRender((i) => i + 1);
                oldTruthy.current = thruthly;
            }
        });
        return () => form.ignore(name, id);
    }, []);

    return !form.values[name];
}
