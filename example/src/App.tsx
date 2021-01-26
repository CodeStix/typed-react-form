import React, { useState } from "react";
import {
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
    form: Form<T>;
    name: KeyOf<T>;
}) {
    const { value, dirty, defaultValue, error } = useListener(
        props.form,
        props.name
    );

    return (
        <VisualRender>
            <input
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
            <pre>{JSON.stringify(val.values, null, 2)}</pre>
            <pre>{JSON.stringify(val.errorMap, null, 2)}</pre>
            <pre>{JSON.stringify(val.dirtyListener.values, null, 2)}</pre>
            {val.dirty && (
                <p>
                    <strong>DIRTY</strong>
                </p>
            )}
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
        todos: [{ message: "Fix this", priority: "normal", id: 4 }]
    });

    const form = useForm<TodoList>(
        values,
        (values) => ({
            author:
                values.author.length < 3
                    ? "Author name is too short."
                    : undefined,
            name: values.name.length < 3 ? "Title is too short." : undefined
        }),
        true
    );

    return (
        <form
            onSubmit={async (ev) => {
                ev.preventDefault();
                console.log("submitting");
                await new Promise((res) => setTimeout(res, 500));
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

function TodoItemList(props: { parent: Form<TodoList> }) {
    const form = useChildForm(props.parent, "todos");
    const { values } = useAnyListener(form, true);

    return (
        <div>
            <ul style={{ padding: "0" }}>
                {values.map((e, i) => (
                    <TodoItem key={e.id} parent={form} index={i} />
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
        </div>
    );
}

function TodoItem(props: { parent: Form<Todo[]>; index: number }) {
    const form = useChildForm(props.parent, props.index);

    console.log("render item", props.index);

    return (
        <li
            style={{
                padding: "1em",
                margin: "1em",
                border: "1px solid #0003"
            }}
        >
            <VisualRender>
                <p>Favorite food</p>
                <Input form={form} name="message" />
                <p>Intelligence</p>
                <Input form={form} name="priority" />
                <FormValues form={form} />
            </VisualRender>
        </li>
    );
}
