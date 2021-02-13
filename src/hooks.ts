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
export function useForm<T, State = DefaultState, Error = DefaultError>(defaultValues: T, defaultState: State, validator?: Validator<T, Error>, validateOnChange = true) {
    let c = useRef<FormState<T, State, Error> | null>(null);

    if (!c.current) {
        c.current = new FormState(defaultValues, defaultValues, defaultState, validator, validateOnChange);
    }

    useEffect(() => {
        c.current!.setValues(defaultValues, true, true);
    }, [defaultValues]);

    return c.current;
}

/**
 * Creates a nested form for another root or nested form. You must use this for object and array (see useArrayListener) field.
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
        c.current!.setValues(parentForm.defaultValues[name] ?? ({} as any), true, true, false, false);
        // Then, set new values and notify children
        c.current!.setValues(parentForm.values[name] ?? ({} as any), true, false, true, false);

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
export function useListener<T, State, Error, Key extends keyof T>(form: FormState<T, State, Error>, name: Key, onlyOnSetValues = false) {
    const [, setRender] = useState(0);

    useEffect(() => {
        let id = form.listen(name, (all) => {
            if (!onlyOnSetValues || all) setRender((e) => e + 1);
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
 * @param onlyOnSetValues True if you only want to listen for changes that are set using setValues. (used for arrays)
 */
export function useAnyListener<T, State, Error>(form: FormState<T, State, Error>, onlyOnSetValues = false) {
    const [, setRender] = useState(0);

    useEffect(() => {
        let id = form.listenAny((all) => {
            if (!onlyOnSetValues || all) setRender((e) => e + 1);
        });
        return () => form.ignoreAny(id);
    }, [form]);

    return form;
}

/**
 * This is a wrapper around useChildForm, with useful functions to manipulate arrays.
 * This hook does cause a rerender, but only if the whole array changes.
 * @param parent The parent form.
 * @param name The parent's field to create a child form for.
 */
export function useArrayListener<Parent, ParentState, ParentError, Key extends keyof Parent>(parent: FormState<Parent, ParentState, ParentError>, name: Key) {
    const form = useChildForm<Parent, ParentState, ParentError, Key>(parent, name);
    useAnyListener(form, true);

    function append(value: Parent[Key][keyof Parent[Key]]) {
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
        form: form,
        values: form.values,
        setValues: form.setValues
    };
}
