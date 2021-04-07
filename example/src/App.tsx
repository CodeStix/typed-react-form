import React, { useState } from "react";
import {
    AnyListener,
    ArrayForm,
    FormError,
    FormState,
    FormInput,
    FormSelect,
    useAnyListener,
    useChildForm,
    useForm,
    Listener,
    FormTextArea,
    ChildForm,
    useArrayForm
} from "typed-react-form";
import { VisualRender } from "./VisualRender";
// import * as yup from "yup";
// import { yupValidator } from "typed-react-form-yup";
import tv from "typed-object-validator";

interface ExampleFormData {
    id: number;
    name: string;
    description: string;
    author: User | null;
    public: boolean;
    date: number;
    dateObject: Date;
    language: "en" | "nl" | "fr";
    tags: string[];
    todos: Todo[];
}

interface Todo {
    message: string;
    priority: "low" | "normal" | "high";
}

interface User {
    name: string;
    age: number;
}

export default function App() {
    return (
        <div>
            <div style={{ padding: "2em", background: "#333", color: "white" }}>
                <h1>
                    Example form created using{" "}
                    <a style={{ color: "#3793ee" }} href="https://github.com/CodeStix/typed-react-form">
                        typed-react-form
                    </a>
                </h1>
                <p>
                    The <strong style={{ color: "red" }}>red flash</strong> indicates which parts of the form are being rerendered. The{" "}
                    <strong style={{ outline: "3px solid gray" }}>gray outline</strong> indicates that a field is dirty (modified) and the{" "}
                    <strong style={{ outline: "3px solid red" }}>red outline</strong> indicates an error.
                </p>
                <p>
                    Every part of this form's{" "}
                    <a style={{ color: "#3793ee" }} href="https://github.com/CodeStix/typed-react-form/blob/master/example/src/App.tsx">
                        source code
                    </a>{" "}
                    is type-checked.
                </p>
            </div>
            <Form />
        </div>
    );
}

const initialValues: ExampleFormData = {
    id: Math.ceil(Math.random() * 100000),
    name: "My todo list",
    description: "this is a testing form",
    author: null,
    public: true,
    date: new Date("1990-01-12T00:00:00.000Z").getTime(),
    dateObject: new Date("1990-01-12T00:00:00.000Z"),
    tags: ["test"],
    language: "en",
    todos: [{ message: "This is a todo", priority: "normal" }]
};

const TodoListSchema = tv.object({
    name: tv.string().min(5, "Enter a longer name"),
    language: tv.value("en").or(tv.value("nl", "Must be english or dutch")),
    todos: tv.array(
        tv.object({
            message: tv.string().min(1, "Enter a todo")
        })
    )
});

// const TodoListSchema = yup.object({
//     name: yup.string().required("Enter a name").min(5, "Enter a longer name"),
//     language: yup.string().oneOf(["en", "nl"], "Must be english or dutch"),
//     todos: yup.array().of(
//         yup.object({
//             message: yup.string().required("Enter a todo")
//         })
//     )
// });

export function ArrayTest() {
    const [values, setValues] = useState({ name: "a list", items: ["asdf"] });
    const form = useForm(values);
    const arrayForm = useArrayForm(form, "items");
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log(form.values);
                setValues({ ...form.values });
            }}
        >
            <p>Name</p>
            <FormInput form={form} name="name" />
            <p>Items</p>
            <ul>
                {arrayForm.values.map((_, i) => (
                    <li>
                        <FormInput key={i} form={arrayForm.form} name={i} />
                        <button type="button" onClick={() => arrayForm.remove(i)}>
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
            <button type="button" onClick={() => arrayForm.append("")}>
                Add item
            </button>
            <button>Submit</button>
        </form>
    );
}

export function Form() {
    const form = useForm(
        initialValues, // <- Default values, may change
        (values) => TodoListSchema.validate(values),
        false, // <- Validate on change (optional)
        false // <- Validate on mount (optional)
    );

    return (
        <form
            onSubmit={form.handleSubmit(async () => {
                await new Promise((res) => setTimeout(res, 1000)); // Fake fetch

                form.setDefaultValues(form.values); // Set new default values
            })}
        >
            <div style={{ display: "grid", gridTemplateColumns: "60% 40%", gridTemplateRows: "100%", gap: "2em", margin: "2em" }}>
                <VisualRender>
                    <h3>
                        Id <small>number</small>
                    </h3>
                    <FormInput type="number" form={form} name="id" />
                    <hr />
                    <h3>
                        Name <small>string</small>
                    </h3>
                    <FormInput form={form} name="name" />
                    <FormError form={form} name="name" />
                    <hr />
                    <h3>
                        Public? <small>boolean</small>
                    </h3>
                    <p>Using radio buttons</p>
                    <label>
                        <FormInput type="radio" form={form} name="public" value={false} /> no
                    </label>
                    <label>
                        <FormInput type="radio" form={form} name="public" value={true} /> yes
                    </label>
                    <p>Using checkbox</p>
                    <label>
                        <FormInput type="checkbox" form={form} name="public" /> yes/no
                    </label>
                    <hr />
                    <h3>
                        Language <small>enum</small>
                    </h3>
                    <p>Using select</p>
                    <FormSelect form={form} name="language">
                        <option value="en">English</option>
                        <option value="nl">Dutch</option>
                        <option value="fr">French</option>
                    </FormSelect>
                    <FormError form={form} name="language" />
                    <p>Using radio buttons</p>
                    <label>
                        <FormInput type="radio" form={form} name="language" value="en" /> English
                    </label>
                    <label>
                        <FormInput type="radio" form={form} name="language" value="nl" /> Dutch
                    </label>
                    <label>
                        <FormInput type="radio" form={form} name="language" value="fr" /> French
                    </label>
                    <hr />
                    <h3>
                        Todo's <small>dynamic array</small>
                    </h3>
                    {/* Use ArrayForm (wrapper around useArrayForm) to create dynamic forms */}
                    <FormError form={form} name="todos" />
                    <ArrayForm
                        form={form}
                        name="todos"
                        render={(
                            { form, swap, remove, append, values, setValues } // <- Make sure to use the newly passed form (otherwise type checking will not work!)
                        ) => (
                            <VisualRender>
                                <pre>{form.values.length}</pre>
                                <ul>
                                    {form.values.map((
                                        _,
                                        i // You should use other key than index
                                    ) => (
                                        <TodoItem swap={swap} remove={remove} key={i} parent={form} index={i} />
                                    ))}
                                </ul>
                                <button
                                    type="button"
                                    onClick={() => {
                                        append({
                                            message: "",
                                            priority: "normal"
                                        });
                                    }}
                                >
                                    Add item
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setValues([
                                            ...values,
                                            ...Array(10)
                                                .fill(0)
                                                .map((_, i) => ({
                                                    message: "Fix this " + i,
                                                    priority: "normal" as "normal" // Wut
                                                }))
                                        ]);
                                    }}
                                >
                                    Add 10 items
                                </button>
                            </VisualRender>
                        )}
                    />
                    <button type="button" onClick={() => form.setError("todos", "There is something wrong with the array")}>
                        Set array error
                    </button>
                    <hr />
                    <h3>
                        Date <small>timestamp number</small>
                    </h3>
                    <FormInput type="date" form={form} name="date" dateAsNumber />
                    <hr />
                    <h3>
                        Date <small>date object</small>
                    </h3>
                    <FormInput type="date" form={form} name="dateObject" />
                    <Listener
                        form={form}
                        name="dateObject"
                        render={({ value }) => <p>Your age is {new Date().getFullYear() - value.getFullYear()}</p>}
                    />
                    <hr />
                    <h3>
                        Tags <small>string array</small>
                    </h3>
                    <p>
                        Using select with <code>multiple=true</code>
                    </p>
                    <FormSelect form={form} name="tags" multiple>
                        <option value="test">Test</option>
                        <option value="fun">Fun</option>
                        <option value="school">School</option>
                    </FormSelect>
                    <p>Using checkboxes</p>
                    <label>
                        <FormInput form={form} name="tags" type="checkbox" value="test" />
                        Test
                    </label>
                    <label>
                        <FormInput form={form} name="tags" type="checkbox" value="fun" />
                        Fun
                    </label>
                    <label>
                        <FormInput form={form} name="tags" type="checkbox" value="school" />
                        School
                    </label>
                    <hr />
                    <h3>Togglable object field</h3>
                    <label>
                        <FormInput form={form} name="author" type="checkbox" setNullOnUncheck value={{ name: "", age: 0 }} />
                        Enable author
                    </label>
                    <ChildForm
                        form={form}
                        name="author"
                        render={(form) => (
                            <VisualRender>
                                <div style={{ background: "#0001", padding: "1em" }}>
                                    <p>Name</p>
                                    <FormInput form={form} name="name" />
                                    <p>Age</p>
                                    <FormInput form={form} name="age" type="number" />
                                    <button type="button" onClick={() => form.setErrors("This is a parent error")}>
                                        Set parent error
                                    </button>
                                    <button type="button" onClick={() => form.parent.setValue("author", null, true)}>
                                        Test
                                    </button>
                                </div>
                            </VisualRender>
                        )}
                    />
                    <hr />
                    <h3>
                        Description <small>string</small>
                    </h3>
                    <p>
                        Using <code>FormTextArea</code>
                    </p>
                    <FormTextArea form={form} name="description" rows={5} cols={50} />
                    <p>
                        Using <code>Listener</code> around <code>textarea</code>
                    </p>
                    <Listener
                        form={form}
                        name="description"
                        render={({ value, setValue }) => (
                            <textarea rows={5} cols={50} value={value} onChange={(ev) => setValue(ev.target.value)}></textarea>
                        )}
                    />
                </VisualRender>
                <div style={{ position: "sticky", top: "0", height: "500px" }}>
                    <h2>Output</h2>
                    <FormValues form={form} />

                    {/* Disable buttons when form is submitting or when nothing has changed, the AnyListener wrapper is required */}
                    <AnyListener
                        form={form}
                        render={({ state, dirty }) => (
                            <div style={{ margin: "0.5em 0" }}>
                                <button type="submit" style={{ fontSize: "1.3em" }} disabled={state.isSubmitting || !dirty}>
                                    Submit
                                </button>
                                <button
                                    style={{ fontSize: "1.3em" }}
                                    disabled={state.isSubmitting || !dirty}
                                    type="button"
                                    onClick={() => form.resetAll()}
                                >
                                    Reset
                                </button>
                            </div>
                        )}
                    />

                    <div>
                        <button style={{ fontSize: "1.3em" }} type="button" onClick={() => form.validate()}>
                            Validate
                        </button>
                        <label>
                            <code>validateOnChange</code>
                            <input
                                type="checkbox"
                                defaultChecked={form.validateOnChange}
                                onChange={(e) => (form.validateOnChange = e.target.checked)}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </form>
    );
}

function TodoItem(props: {
    key: number;
    parent: FormState<Todo[]>;
    index: number;
    swap: (a: number, b: number) => void;
    remove: (a: number) => void;
}) {
    // Use a child form, each layer in the object is a seperate form: TodoList (useForm) -> Todo[] (useArrayForm) -> Todo (useChildForm)
    const form = useChildForm(props.parent, props.index);

    return (
        <li
            style={{
                padding: "0.5em"
            }}
        >
            <VisualRender>
                <FormInput form={form} name="message" />
                <FormSelect form={form} name="priority">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                </FormSelect>
                <button type="button" onClick={() => props.swap(props.index, 0)}>
                    Go to top
                </button>
                <button type="button" onClick={() => props.remove(props.index)}>
                    Remove
                </button>
            </VisualRender>
        </li>
    );
}

/**
 *  Shows a JSON representation of a form
 */
function FormValues<T extends object>(props: { form: FormState<T> }) {
    const form = useAnyListener(props.form);
    const [show, setShow] = useState({ values: true, defaultValues: false, errorMap: true, dirtyMap: true, state: false });
    return (
        <VisualRender>
            <div style={{ background: "#0001", overflow: "hidden", padding: "1em", borderRadius: "1em" }}>
                <p>
                    <strong style={{ color: form.dirty ? "blue" : undefined }}>{form.dirty ? "Modified" : "Unmodified"}</strong>
                </p>
                <p>
                    <strong style={{ color: form.error ? "red" : undefined }}>{form.error ? "Has error" : "No errors"}</strong>
                </p>

                <div>
                    <strong>Show: </strong>
                    <label>
                        <input type="checkbox" checked={show.values} onChange={(ev) => setShow({ ...show, values: ev.target.checked })} />
                        <code>values</code>
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={show.defaultValues}
                            onChange={(ev) => setShow({ ...show, defaultValues: ev.target.checked })}
                        />
                        <code>defaultValues</code>
                    </label>
                    <label>
                        <input type="checkbox" checked={show.errorMap} onChange={(ev) => setShow({ ...show, errorMap: ev.target.checked })} />
                        <code>errorMap</code>
                    </label>
                    <label>
                        <input type="checkbox" checked={show.dirtyMap} onChange={(ev) => setShow({ ...show, dirtyMap: ev.target.checked })} />
                        <code>dirtyMap</code>
                    </label>
                    <label>
                        <input type="checkbox" checked={show.state} onChange={(ev) => setShow({ ...show, state: ev.target.checked })} />
                        <code>state</code>
                    </label>
                </div>

                {show.values && <pre>values = {JSON.stringify(form.values, null, 2)}</pre>}
                {show.defaultValues && <pre>defaultValues = {JSON.stringify(form.defaultValues, null, 2)}</pre>}
                {show.errorMap && <pre>errorMap = {JSON.stringify(form.errorMap, null, 2)}</pre>}
                {show.dirtyMap && <pre>dirtyMap = {JSON.stringify(form.dirtyMap, null, 2)}</pre>}
                {show.state && <pre>state = {JSON.stringify(form.state, null, 2)}</pre>}
            </div>
        </VisualRender>
    );
}

// You should use a validation library (yup, class-validator) instead of this mess...
// function validateTodoList(values: ExampleFormData) {
//     let todoErrors = values.todos.reduce((prev, val, index) => {
//         if (val.message.length < 5) {
//             prev[index] = { message: "Todo message should be longer!" };
//         }
//         return prev;
//     }, [] as any[]);
//     return {
//         // author: values.author.length < 3 ? "Author name is too short." : undefined,
//         name: values.name.length < 3 ? "Title is too short." : undefined,
//         todos: todoErrors.length > 0 ? todoErrors : undefined
//     };
// }
