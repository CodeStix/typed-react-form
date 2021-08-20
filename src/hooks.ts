import { useRef, useEffect, useState, useCallback } from "react";
import { DefaultState, DefaultError, FormState, ChildFormState, Validator, FieldsOfType, KeysOfType, ErrorType } from "./form";

/**
 * Creates a new root form.
 * This hook doesn't cause a rerender.
 * @param defaultValues The default values for this form. When this value changes, nothing happens, use useEffect() with form.setValues to set form values on state change.
 * @param validator The validator to use, optional.
 * @param validateOnChange Validate on change? Optional, default is false.
 * @param validateOnMount Validate on mount? Optional, default is false.
 * @param defaultState The default state for this form. Form state contains custom global states, example: isSubmitting, isLoading ... Optional, default is `{ isSubmitting: false }`.
 */
export function useForm<T extends object, State = DefaultState, Error extends string = DefaultError>(
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

    return c.current;
}

/**
 * Creates a nested form for another root or nested form. You must use this for object and array (see useArrayField) field.
 * This hook doesn't cause a rerender.
 * @param parentForm The parent form.
 * @param name The parent's field to create a child form for.
 */
export function useObjectField<
    T extends FieldsOfType<any, object | any[]>,
    K extends KeysOfType<T, object | any[]>,
    State = DefaultState,
    Error extends string = DefaultError
>(parentForm: FormState<T, State, Error>, name: K) {
    let c = useRef<ChildFormState<T, K, State, Error> | null>(null);
    if (!c.current) {
        c.current = new ChildFormState(parentForm, name);
    }

    useEffect(() => {
        // Update parent and child form
        parentForm.childMap[name] = c.current!;
        c.current!.name = name;

        // First, set new default values, without validating
        c.current!.setValues(parentForm.defaultValues[name], false, true, true, false);
        // Then, set new values and validate if needed
        c.current!.setValues(parentForm.values[name], c.current!.validateOnMount, false, true, true);

        return () => {
            // Only delete if is not already overwritten by new form
            if (parentForm.childMap[name] === c.current!) {
                delete parentForm.childMap[name];
            }
        };
    }, [parentForm, name]);

    return c.current;
}

export interface FormField<
    T extends object = any,
    K extends keyof T = never,
    State extends DefaultState = DefaultState,
    Error extends string = DefaultError
> {
    value: T[K];
    defaultValue: T[K];
    setValue: (value: T[K]) => void;
    dirty: boolean;
    error: ErrorType<T[K], Error> | undefined;
    state: State;
    form: FormState<T, State, Error>;
}

/**
 * Listen for changes on a form's field. Behaves like useState.
 * You shouldn't use this hook in large components, as it rerenders each time something changes. Use the wrapper <Listener /> instead.
 * @param form The form to listen on.
 * @param name The form's field to listen to.
 */
export function useListener<T extends object, K extends keyof T, State extends DefaultState = DefaultState, Error extends string = DefaultError>(
    form: FormState<T, State, Error>,
    name: K
): FormField<T, K, State, Error> {
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
        setValue: (value: T[K]) => form.setValue(name, value),
        dirty: form.dirtyMap[name] ?? false,
        error: form.errorMap[name],
        state: form.state,
        form
    };
}

/**
 * Listens for any change on this form. Behaves like useState.
 * You shouldn't use this hook in large components, as it rerenders each time something changes. Use the wrapper <AnyListener /> instead.
 *
 * @param form The form that was passed in.
 */
export function useAnyListener<T extends object, State = DefaultState, Error extends string = DefaultError>(form: FormState<T, State, Error>) {
    const [, setRender] = useState(0);

    useEffect(() => {
        let id = form.listenAny(() => {
            setRender((e) => e + 1);
        });
        return () => {
            form.ignoreAny(id);
        };
    }, [form]);

    return form;
}

/**
 * This is a wrapper around useObjectForm, with useful functions to manipulate arrays.
 * This hook does cause a rerender, but only if the array size changes.
 * @param parentForm The parent form.
 * @param name The parent's field to create a child form for.
 */
export function useArrayField<
    T extends FieldsOfType<any, any[]>,
    K extends KeysOfType<T, any[] | object>,
    State = DefaultState,
    Error extends string = DefaultError
>(parentForm: FormState<T, State, Error>, name: K) {
    const form = useObjectField(parentForm, name);
    const oldLength = useRef(-1);
    const [, setRender] = useState(0);

    // Only rerender when array size changed
    useEffect(() => {
        let id = parentForm.listen(name, () => {
            let val = parentForm.values[name] as any;
            if (Array.isArray(val) && val.length !== oldLength.current) {
                setRender((i) => i + 1);
                oldLength.current = val.length;
            }
        });
        return () => parentForm.ignore(name, id);
    }, []);

    const append = useCallback((value: NonNullable<T[K]>[any]) => {
        form.setValues([...(form.values as any), value] as any, true, false);
    }, []);

    const remove = useCallback((index: number) => {
        let newValues = [...(form.values as any)];
        newValues.splice(index, 1);
        form.setValues(newValues as any, true, false);
    }, []);

    const clear = useCallback(() => {
        form.setValues([] as any, true, false);
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
        form.setValues(newArr as any, true, false);
    }, []);

    const swap = useCallback((index: number, newIndex: number) => {
        if (index === newIndex) {
            return;
        }
        let values = [...(form.values as any)];
        [values[index], values[newIndex]] = [values[newIndex], values[index]];
        form.setValues(values as any, true, false);
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
 * Listen for truthy changes (if a value becomes truthy or falsy) on a form's field.
 * @param form The form to listen on.
 * @param name The form's field to listen to.
 */
export function useTruthyListener<T extends object, K extends keyof T, State = DefaultState, Error extends string = DefaultError>(
    form: FormState<T, State, Error>,
    name: K
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
