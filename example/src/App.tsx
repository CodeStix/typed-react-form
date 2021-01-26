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
    const val = useAnyListener(props.form);

    return (
        <VisualRender>
            <div style={{ background: "#0001" }}>
                <p>
                    <em>{val.formId}</em>
                </p>
                <pre>{JSON.stringify(val.values, null, 2)}</pre>
                {/* <pre>{JSON.stringify(val.defaultValues)}</pre> */}
                <pre>{JSON.stringify(val.errorMap, null, 2)}</pre>
                {/* <pre>{JSON.stringify(val.dirtyListener.values, null, 2)}</pre> */}
                {/* <pre>{JSON.stringify(val.state, null, 2)}</pre> */}
                {val.dirty && (
                    <p>
                        <strong>DIRTY</strong>
                    </p>
                )}
                {val.error && (
                    <p>
                        <strong>ERROR</strong>
                    </p>
                )}
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

export default function App() {
    const [values, setValues] = useState<TodoList>({
        author: "codestix",
        name: "My todo list",
        todos: Array(2)
            .fill(0)
            .map(() => ({
                message: "Fix this",
                priority: "normal",
                id: Math.random()
            }))
    });

    const form = useForm<TodoList, { isSubmitting: boolean }>(
        values,
        { isSubmitting: false },
        (values) => ({
            author:
                values.author.length < 3
                    ? "Author name is too short."
                    : undefined,
            name: values.name.length < 3 ? "Title is too short." : undefined,
            todos: values.todos.reduce((prev, val, index) => {
                if (val.message.length < 5) {
                    prev[index] = { message: "Todo message should be longer!" };
                }
                return prev;
            }, {})
        }),
        true
    );

    return (
        <form
            onSubmit={async (ev) => {
                ev.preventDefault();
                console.log("submitting");
                form.setStateField("isSubmitting", true);
                await new Promise((res) => setTimeout(res, 500));
                form.setStateField("isSubmitting", false);
                console.log("submitted");
                setValues({ ...form.values });
            }}
            style={{ padding: "1em", margin: "1em", border: "1px solid #0003" }}
        >
            <VisualRender>
                <p>Name</p>
                <Input form={form} name="name" />
                <p>Author</p>
                <Input form={form} name="author" />
                <p>Info</p>
                <TodoItemList parent={form} />
                <FormValues form={form} />
                <button type="button" onClick={() => form.resetAll()}>
                    Reset
                </button>
                <button>Submit</button>
            </VisualRender>
        </form>
    );
}

function TodoItemList(props: {
    parent: Form<TodoList, { isSubmitting: boolean }>;
}) {
    // const form = useChildForm(props.parent, "todos");
    // const { values } = useAnyListener(form, true);

    return (
        <ArrayForm parent={props.parent} name="todos">
            {({ form, swap, remove }) => (
                <>
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
                    <FormValues form={form} />
                </>
            )}
        </ArrayForm>
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
