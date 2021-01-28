import React, { useState } from "react";
import {
    Form,
    useForm,
    useListener,
    useAnyListener,
    useChildForm
} from "typed-react-form";
import { VisualRender } from "./VisualRender";

function Input<T extends { [key: string]: any }>({
    form,
    name
}: {
    form: Form<T>;
    name: keyof T;
}) {
    const { value, setValue, error, dirty } = useListener(form, name);

    return (
        <VisualRender>
            <input
                style={{
                    border: error ? "1px solid red" : undefined,
                    background: dirty ? "#eee" : undefined
                }}
                value={value as string}
                onChange={(e) => {
                    setValue(e.target.value as any);
                }}
            />
            {error && (
                <p>
                    <strong>{error}</strong>
                </p>
            )}
        </VisualRender>
    );
}

function Debug(props: { form: Form<any> }) {
    const { values, dirty, dirtyMap, errorMap, error } = useAnyListener(
        props.form
    );

    return (
        <VisualRender>
            <div style={{ padding: "1em", background: "#eee" }}>
                <p>
                    <strong>{dirty ? "MODIFIED" : "UNMODIFIED"}</strong>{" "}
                    <strong>{error ? "ERROR" : "OK"}</strong>
                </p>
                <pre>{JSON.stringify(values, null, 2)}</pre>
                <pre>{JSON.stringify(dirtyMap, null, 2)}</pre>
                <pre>{JSON.stringify(errorMap, null, 2)}</pre>
            </div>
        </VisualRender>
    );
}

interface TodoList {
    name: string;
    info: {
        authorName: string;
        createdAt: number;
        more: {
            slug: string;
        };
    };
    todos: Todo[];
}

interface Todo {
    message: string;
    priority: "low" | "normal" | "high";
}

export default function App() {
    const [values] = useState<TodoList>({
        info: {
            authorName: "codestix",
            createdAt: new Date().getTime(),
            more: { slug: "test" }
        },
        name: "TODO List",
        todos: []
    });
    const form = useForm(values);

    return (
        <VisualRender>
            <form
                onSubmit={(ev) => {
                    ev.preventDefault();
                    console.log(
                        "submit",
                        values,
                        form.values,
                        values === form.values
                    );
                    form.setValues({ ...form.values }, true);
                }}
                style={{
                    margin: "2em",
                    padding: "1em",
                    border: "1px solid #0005"
                }}
            >
                <p>Author name</p>
                <Input form={form} name="name" />
                <TodoInfo parent={form} />
                <Debug form={form} />
                <button>Save</button>
                <button type="button" onClick={() => form.reset()}>
                    Reset
                </button>
                <button
                    type="button"
                    onClick={() =>
                        form.setError(
                            "name",
                            form.errorMap["name"] ? undefined : "Name not epic"
                        )
                    }
                >
                    Set error
                </button>
            </form>
        </VisualRender>
    );
}

function TodoInfo(props: { parent: Form<TodoList> }) {
    const form = useChildForm(props.parent, "info");

    return (
        <VisualRender>
            <div
                style={{
                    margin: "1em",
                    padding: "1em",
                    border: "1px solid #0005"
                }}
            >
                <p>Author name</p>
                <Input form={form} name="authorName" />
                <TodoInfoMore parent={form} />
                <button
                    type="button"
                    onClick={() =>
                        form.setError(
                            "authorName",
                            form.errorMap["authorName"]
                                ? undefined
                                : "Author name not epic"
                        )
                    }
                >
                    Set error
                </button>
            </div>
        </VisualRender>
    );
}

function TodoInfoMore(props: { parent: Form<TodoList["info"]> }) {
    const form = useChildForm(props.parent, "more");

    return (
        <VisualRender>
            <div
                style={{
                    margin: "1em",
                    padding: "1em",
                    border: "1px solid #0005"
                }}
            >
                <p>Slug</p>
                <Input form={form} name="slug" />
            </div>
        </VisualRender>
    );
}
