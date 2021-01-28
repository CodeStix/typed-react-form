import { useRef, useEffect, useState } from "react";
import {
    DefaultState,
    DefaultError,
    FormState,
    ChildFormState,
    Validator
} from "./form";

export function useForm<T, State = DefaultState, Error = DefaultError>(
    defaultValues: T,
    defaultState: State,
    validator?: Validator<T, Error>,
    validateOnChange = true
) {
    let c = useRef<FormState<T, State, Error> | null>(null);

    if (!c.current) {
        c.current = new FormState(
            defaultValues,
            defaultValues,
            defaultState,
            validator,
            validateOnChange
        );
    }

    useEffect(() => {
        c.current!.setValues(defaultValues, true);
    }, [defaultValues]);

    return c.current;
}

export function useChildForm<T, State, Error, Key extends keyof T>(
    parentForm: FormState<T, State, Error>,
    name: Key
) {
    let c = useRef<ChildFormState<T, State, Error, Key> | null>(null);
    if (!c.current) {
        c.current = new ChildFormState(parentForm, name);
    }

    useEffect(() => {
        c.current!.setValues(
            parentForm.values[name] ?? ({} as any),
            false,
            true,
            false
        );
        return () => {
            delete parentForm.errorMap[name];
            delete parentForm.dirtyMap[name];
        };
    }, [parentForm, name]);

    return c.current;
}

export function useListener<T, State, Error, Key extends keyof T>(
    form: FormState<T, State, Error>,
    name: Key
) {
    const [, setRender] = useState(0);

    useEffect(() => {
        let id = form.listen(name, () => setRender((e) => e + 1));
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

export function useAnyListener<T, State, Error>(
    form: FormState<T, State, Error>,
    onlyOnSetValues = false
) {
    const [, setRender] = useState(0);

    useEffect(() => {
        let id = form.listenAny((all) => {
            if (form.formId === 3) console.trace("all?", all);
            if (!onlyOnSetValues || all) setRender((e) => e + 1);
        });
        return () => form.ignoreAny(id);
    }, [form]);

    return form;
}

export function useArrayForm<
    Parent,
    ParentState,
    ParentError,
    Key extends keyof Parent
>(parent: FormState<Parent, ParentState, ParentError>, name: Key) {
    const form = useChildForm<Parent, ParentState, ParentError, Key>(
        parent,
        name
    );
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
