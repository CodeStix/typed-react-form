import React, { InputHTMLAttributes, useState } from "react";
import {
    AnyListener,
    ArrayField,
    FormFieldProps,
    FormState,
    KeyOf,
    ObjectOrArray,
    useChildForm,
    useForm,
    useListener
} from "fast-react-form";
import { VisualRender } from "./VisualRender";

// First, wrap your UI components

interface SubmittingState {
    isSubmitting: boolean;
}

type InputProps<
    T extends ObjectOrArray,
    TError,
    TState extends SubmittingState
> = FormFieldProps<InputHTMLAttributes<HTMLInputElement>, T, TError, TState>;

function TextInput<T extends ObjectOrArray, U, V extends SubmittingState>({
    form,
    name,
    ...rest
}: InputProps<T, U, V>) {
    const { value, setValue, error, dirty, state } = useListener(form, name);
    return (
        <>
            <input
                disabled={state.isSubmitting}
                style={{
                    padding: "0.3em",
                    border: error ? "1px solid red" : "1px solid #0003",
                    background: dirty ? "#eee" : "#fff",
                    fontSize: "inherit"
                }}
                value={value}
                onChange={(ev) => setValue(ev.target.value as T[KeyOf<T>])}
                {...rest}
            />
            {error && (
                <span
                    style={{
                        color: "red",
                        display: "inline-block",
                        padding: "0.3em",
                        fontWeight: "bold"
                    }}
                >
                    {error}
                </span>
            )}
        </>
    );
}

// Then, reuse them in your application

type TodoPriority = "normal" | "important";

interface Todo {
    id: string;
    message: string;
    priority: TodoPriority;
}

interface TodoList {
    name: string;
    authorName: string;
    todos: Todo[];
}

export default function App() {
    const [defaultValues, setDefaultValues] = useState<TodoList>({
        authorName: "codestix",
        name: "My TODO list",
        todos: [
            {
                id: "0",
                message: "Do this",
                priority: "normal"
            }
        ]
    });

    const form = useForm(
        defaultValues,
        { isSubmitting: false },
        validateTodoList,
        true,
        true
    );

    return (
        <VisualRender>
            <form
                style={{ margin: "3em" }}
                onSubmit={async (ev) => {
                    ev.preventDefault();
                    form.validate();
                    if (form.error) return;
                    console.log("submit", form.values);
                    form.setState({ isSubmitting: true });
                    await new Promise((res) => setTimeout(res, 1000));
                    form.setState({ isSubmitting: false });
                    setDefaultValues(form.values);
                }}
            >
                <TextInput
                    form={form}
                    name="name"
                    style={{ display: "block", fontSize: "1.3em" }}
                />
                <TextInput form={form} name="authorName" />

                <ArrayField
                    name="todos"
                    parent={form}
                    render={({ values, append, remove, form, move }) => (
                        <VisualRender>
                            <AnyListener
                                form={form}
                                render={() => (
                                    <code>
                                        {JSON.stringify(form.errorMap, null, 2)}
                                    </code>
                                )}
                            />
                            <ul>
                                {values.map((e, i) => (
                                    <TodoItem
                                        key={e.id}
                                        index={i}
                                        moveToTop={() => move(i, 0)}
                                        remove={() => remove(i)}
                                        parent={form}
                                    />
                                ))}
                            </ul>
                            <button
                                type="button"
                                onClick={() => {
                                    append({
                                        id: "" + new Date().getTime(),
                                        message: "",
                                        priority: "normal"
                                    });
                                }}
                            >
                                New item
                            </button>
                        </VisualRender>
                    )}
                />

                <AnyListener
                    form={form}
                    render={({
                        state: { isSubmitting },
                        values,
                        dirty,
                        errorMap
                    }) => (
                        <VisualRender>
                            <div style={{ background: "#eee" }}>
                                <pre>{JSON.stringify(values, null, 2)}</pre>
                                {dirty && (
                                    <p>
                                        <strong>DIRTY</strong>
                                    </p>
                                )}
                                <pre>{JSON.stringify(errorMap, null, 2)}</pre>
                            </div>

                            <button disabled={isSubmitting}>Submit</button>
                            <button
                                disabled={isSubmitting}
                                type="button"
                                onClick={() => form.reset()}
                            >
                                Reset
                            </button>
                        </VisualRender>
                    )}
                />
            </form>
        </VisualRender>
    );
}

function TodoItem(props: {
    parent: FormState<Todo[], string, { isSubmitting: boolean }>;
    index: number;
    remove: () => void;
    moveToTop: () => void;
}) {
    const form = useChildForm(
        props.parent,
        props.index,
        ({ message }) => ({
            message: message.length > 10 ? "message is too long!" : undefined
        }),
        true
    );

    return (
        <li>
            <AnyListener
                form={form}
                render={() => (
                    <code>{JSON.stringify(form.errorMap, null, 2)}</code>
                )}
            />

            <button
                type="button"
                onClick={() => form.setError("message", "this is a test")}
            >
                Set error
            </button>

            <VisualRender>
                <TextInput form={form} name="message" />
                <button type="button" onClick={() => props.remove()}>
                    Remove
                </button>
                <button type="button" onClick={() => props.moveToTop()}>
                    Move to top
                </button>
            </VisualRender>
        </li>
    );
}

// Example validator, you should use a validation library instead of this mess.
function validateTodoList(list: TodoList) {
    return {
        name: list.name.length <= 2 ? "Please choose a longer name" : undefined,
        authorName:
            list.authorName.length <= 2
                ? "Please choose a longer author name"
                : undefined
    };
}
//     return list.todos
//         .filter((e) => e.message.length < 5)
//         .reduce((prev, _val, index) => {
//             let l = prev["todos"];
//             if (!l) {
//                 l = {};
//                 prev["todos"] = l;
//             }
//             l[index] = { message: "Todo message should be longer!" };
//             return prev;
//         }, {});
// }
