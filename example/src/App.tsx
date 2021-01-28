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
                disabled={form.state.isSubmitting}
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
    };
    todos: Todo[];
}

interface Todo {
    id: number;
    message: string;
    priority: "low" | "normal" | "high";
}

export default function App() {
    const [values] = useState<TodoList>({
        info: {
            authorName: "codestix",
            createdAt: new Date().getTime()
        },
        name: "TODO List",
        todos: [
            {
                id: 0,
                message: "this is a test",
                priority: "normal"
            }
        ]
    });
    const form = useForm(values, { isSubmitting: false }, (values) => ({
        name: values.name.length < 3 ? "Name must be longer!" : undefined,
        info: {
            authorName:
                values.info.authorName.length < 3
                    ? "Author name must be longer!"
                    : undefined
        }
    }));

    return (
        <VisualRender>
            <form
                onSubmit={async (ev) => {
                    ev.preventDefault();
                    form.setState({ isSubmitting: true });
                    await new Promise((res) => setTimeout(res, 1000));
                    form.setState({ isSubmitting: false });
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
                <Todos parent={form} />
                <Debug form={form} />
                <button>Save</button>
                <button type="button" onClick={() => form.resetAll()}>
                    Reset
                </button>
                <button
                    type="button"
                    onClick={() =>
                        form.setErrors({ info: { authorName: "yikm,es" } })
                    }
                >
                    Set error
                </button>
            </form>
        </VisualRender>
    );
}

function Todos(props: { parent: Form<TodoList> }) {
    const form = useChildForm(props.parent, "todos");

    return (
        <VisualRender>
            <div
                style={{
                    margin: "1em",
                    padding: "1em",
                    border: "1px solid #0005"
                }}
            >
                {form.values.map((e, i) => (
                    <Todo parent={form} key={e.id} index={i} />
                ))}
            </div>
        </VisualRender>
    );
}

function Todo(props: { parent: Form<Todo[]>; index: number }) {
    const form = useChildForm(props.parent, props.index);

    return (
        <VisualRender>
            <div
                style={{
                    margin: "1em",
                    padding: "1em",
                    border: "1px solid #0005"
                }}
            >
                <Input form={form} name="message" />
            </div>
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
