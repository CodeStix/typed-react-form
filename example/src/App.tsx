import React, { InputHTMLAttributes, useState } from "react";
import {
    ArrayForm,
    Form,
    KeyOf,
    ObjectOrArray,
    useAnyListener,
    useChildForm,
    useForm,
    useListener
} from "typed-react-form";
import { VisualRender } from "./VisualRender";

interface TodoList {
    name: string;
    author: string;
    todos: Todo[];
}

interface Todo {
    id: number;
    message: string;
    priority: "low" | "normal" | "high";
}

/**
 * A custom input that can be reused everywhere when using useForm
 */
function Input<T extends ObjectOrArray>({
    form,
    name,
    ...rest
}: {
    form: Form<T, { isSubmitting: boolean }>;
    name: KeyOf<T>;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "form">) {
    const { value, dirty, defaultValue, error, state } = useListener(
        form,
        name
    );

    return (
        <VisualRender>
            <input
                disabled={state.isSubmitting}
                placeholder={defaultValue}
                style={{
                    background: dirty ? "#eee" : "#fff",
                    padding: "0.3em",
                    fontSize: "inherit",
                    outline: error ? "4px solid #f306" : "none"
                }}
                value={value as string}
                onChange={(ev) =>
                    form.setValue(name, ev.target.value as T[KeyOf<T>])
                }
                {...rest}
            />
            {error && (
                <span
                    style={{
                        padding: "0.3em",
                        fontWeight: "bold",
                        color: "red"
                    }}
                >
                    {error}
                </span>
            )}
        </VisualRender>
    );
}

export default function App() {
    const [values, setValues] = useState<TodoList>({
        author: "codestix",
        name: "My todo list",
        todos: Array(3)
            .fill(0)
            .map((_, i) => ({
                message: "Fix this " + i,
                priority: "normal",
                id: i
            }))
    });

    const form = useForm<TodoList, { isSubmitting: boolean }>(
        values, // <- default values, can change
        { isSubmitting: false }, // <- global form state
        validateTodoList, // <- validator
        true // <- validate on change
    );

    return (
        <form
            onSubmit={async (ev) => {
                ev.preventDefault();

                form.validateAll(); // Validate manually when validateOnChange is disabled.
                if (form.error) return; // Do not submit if errors

                form.setStateField("isSubmitting", true); // Set the form state (updates every component listening for state updates)

                await new Promise((res) => setTimeout(res, 1000)); // Fake fetch

                form.setStateField("isSubmitting", false); // Set the form state (updates every component listening for state updates)

                setValues({ ...form.values }); // Set new default values, (form.setDefaultValues is also possible instead of useState/useForm combo!)
            }}
            style={{ padding: "1em", margin: "1em", border: "1px solid #0003" }}
        >
            <VisualRender>
                <h2>Todo list</h2>
                <p>Name</p>
                {/* The name field is type checked, try to name it something else that does not exist on interface TodoList */}
                <Input form={form} name="name" />
                <p>Author</p>
                <Input form={form} name="author" />
                <p>Todo's</p>
                {/* Use ArrayForm (wrapper around useArrayForm) to create dynamic forms */}
                <ArrayForm parent={form} name="todos">
                    {(
                        { form, swap, remove, append } // <- Make sure to use the newly passed form (otherwise type checking will not work!)
                    ) => (
                        <VisualRender>
                            <ul style={{ padding: "0" }}>
                                {form.values.map((e, i) => (
                                    <TodoItem
                                        onMoveTop={() => swap(i, 0)}
                                        onRemove={() => remove(i)}
                                        key={e.id}
                                        parent={form}
                                        index={i}
                                    />
                                ))}
                            </ul>
                            <button
                                type="button"
                                onClick={() =>
                                    append({
                                        message: "",
                                        priority: "normal",
                                        id: new Date().getTime()
                                    })
                                }
                            >
                                Add item
                            </button>
                        </VisualRender>
                    )}
                </ArrayForm>
                <button type="button" onClick={() => form.resetAll()}>
                    Reset
                </button>
                <button>Submit</button>
                <h3>Output</h3>
                <FormValues form={form} />
            </VisualRender>
        </form>
    );
}

function TodoItem(props: {
    parent: Form<Todo[], { isSubmitting: boolean }>;
    index: number;
    onMoveTop: () => void;
    onRemove: () => void;
}) {
    // Use a child form, each layer in the object is a seperate form: TodoList (useForm) -> Todo[] (useArrayForm) -> Todo (useChildForm)
    const form = useChildForm(props.parent, props.index);

    return (
        <li
            style={{
                padding: "1em",
                margin: "1em",
                border: "1px solid #0003"
            }}
        >
            <VisualRender>
                <Input form={form} name="message" />
                <button type="button" onClick={props.onMoveTop}>
                    Go to top
                </button>
                <button type="button" onClick={props.onRemove}>
                    Remove
                </button>
            </VisualRender>
        </li>
    );
}

/**
 *  Shows a JSON representation of a form
 */
function FormValues<T>(props: { form: Form<T> }) {
    const form = useAnyListener(props.form);
    return (
        <VisualRender>
            <div style={{ background: "#0001" }}>
                <p>
                    {/* <em>{val.formId}</em> */}
                    {form.dirty && <strong>DIRTY</strong>}
                    {form.error && <strong>ERROR</strong>}
                </p>
                <pre>{JSON.stringify(form.values, null, 2)}</pre>
                {/* <pre>{JSON.stringify(val.defaultValues)}</pre> */}
                {/* <pre>{JSON.stringify(val.errorMap, null, 2)}</pre> */}
                {/* <pre>{JSON.stringify(val.dirtyListener.values, null, 2)}</pre> */}
                {/* <pre>{JSON.stringify(val.state, null, 2)}</pre> */}
            </div>
        </VisualRender>
    );
}

// You should use a validation library (yup, class-validator) instead of this mess...
function validateTodoList(values: TodoList) {
    let todoErrors = values.todos.reduce((prev, val, index) => {
        if (val.message.length < 5) {
            prev[index] = { message: "Todo message should be longer!" };
        }
        return prev;
    }, {});
    return {
        author:
            values.author.length < 3 ? "Author name is too short." : undefined,
        name: values.name.length < 3 ? "Title is too short." : undefined,
        todos: Object.keys(todoErrors).length > 0 ? todoErrors : undefined
    };
}
