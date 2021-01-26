import React, { useState } from "react";
import {
    ArrayForm,
    Form,
    KeyOf,
    ObjectOrArray,
    useAnyListener,
    useChildForm,
    useForm,
    useListener
} from "fast-react-form";
import { VisualRender } from "./VisualRender";

function Input<T extends ObjectOrArray>(props: {
    form: Form<T, { isSubmitting: boolean }>;
    name: KeyOf<T>;
}) {
    const { value, dirty, defaultValue, error, state } = useListener(
        props.form,
        props.name
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
                    props.form.setValue(
                        props.name,
                        ev.target.value as T[KeyOf<T>]
                    )
                }
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
                console.log("submitting");
                form.validateAll();
                if (form.error) return;
                form.setStateField("isSubmitting", true);
                await new Promise((res) => setTimeout(res, 500));
                form.setStateField("isSubmitting", false);
                console.log("submitted");
                setValues({ ...form.values });
            }}
            style={{ padding: "1em", margin: "1em", border: "1px solid #0003" }}
        >
            <VisualRender>
                <h2>Todo list</h2>
                <p>Name</p>
                <Input form={form} name="name" />
                <p>Author</p>
                <Input form={form} name="author" />
                <p>Todo's</p>
                <ArrayForm parent={form} name="todos">
                    {({ form, swap, remove }) => (
                        <VisualRender>
                            <ul style={{ padding: "0" }}>
                                {form.values.map((e, i) => (
                                    <TodoItem
                                        onTop={() => swap(i, 0)}
                                        onRemove={() => {
                                            remove(i);
                                        }}
                                        key={e.id}
                                        parent={form}
                                        index={i}
                                    />
                                ))}
                            </ul>
                            <button
                                type="button"
                                onClick={() =>
                                    form.setValues([
                                        ...form.values,
                                        {
                                            message: "",
                                            priority: "normal",
                                            id: new Date().getTime()
                                        }
                                    ])
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
    onTop: () => void;
    onRemove: () => void;
}) {
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
                <button type="button" onClick={props.onTop}>
                    Go to top
                </button>
                <button type="button" onClick={props.onRemove}>
                    Remove
                </button>
            </VisualRender>
        </li>
    );
}
