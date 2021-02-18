import React, { useState } from "react";
import { AnyListener, ArrayForm, FormError, FormState, FormInput, FormSelect, useAnyListener, useChildForm, useForm, Listener, FormTextArea, ChildForm } from "typed-react-form";
import { VisualRender } from "./VisualRender";

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

// function Test() {
//     const [values, setValues] = useState({ name: "Onderzoek", age: 18, author: { name: "Stijn", email: "reddusted@gmail.com" }, test: undefined });
//     const form = useForm(values);

//     return (
//         <form
//             onSubmit={(ev) => {
//                 ev.preventDefault();
//                 console.log("submit", form.values);
//                 setValues({ ...form.values, test: { name: "yikes" } as any });
//             }}
//             onReset={() => {
//                 form.resetAll();
//             }}
//         >
//             <p>Name</p>
//             <FormInput form={form} name="name" />
//             <p>Age</p>
//             <FormInput form={form} type="number" name="age" />
//             <p>Author</p>
//             <FormInput form={form} type="checkbox" name="author" setNullOnUncheck value={{ name: "", email: "" }} />
//             <ChildForm
//                 form={form}
//                 name="author"
//                 render={(form) => (
//                     <>
//                         <p>Name</p>
//                         <FormInput form={form} type="text" name="name" />
//                         <p>Email</p>
//                         <FormInput form={form} type="text" name="email" />
//                     </>
//                 )}
//             />
//             <Listener
//                 form={form}
//                 name="author"
//                 onlyOnSetValue
//                 render={(form) => (
//                     <VisualRender>
//                         <code>render? {JSON.stringify(form.value, null, 2)}</code>
//                     </VisualRender>
//                 )}
//             />
//             <AnyListener
//                 form={form}
//                 render={(form) => (
//                     <VisualRender>
//                         <pre>{JSON.stringify(form.values)}</pre>
//                         <pre>{JSON.stringify(form.defaultValues)}</pre>
//                         <pre>{JSON.stringify(form.dirtyMap)}</pre>
//                         <button disabled={!form.dirty || form.error}>Submit</button>
//                         <button disabled={!form.dirty || form.error} type="reset">
//                             Reset
//                         </button>
//                     </VisualRender>
//                 )}
//             />
//         </form>
//     );
// }

// export default Test;

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
    date: new Date().getTime(),
    dateObject: new Date(),
    tags: ["test"],
    language: "en",
    todos: [{ message: "Fix this 0", priority: "normal" }]
};

export function Form() {
    const form = useForm(
        initialValues, // <- Default values, may change
        { isSubmitting: false }, // <- Global form state, which can contain custom fields (e.g. loading)
        validateTodoList, // <- Validator
        true // <- Validate on change
    );

    return (
        <form
            onSubmit={async (ev) => {
                ev.preventDefault();

                form.validate(); // Validate manually when validateOnChange is disabled.
                if (form.error) return; // Do not submit if errors

                form.setState({ isSubmitting: true }); // Set the form state (updates every component listening for state updates)

                await new Promise((res) => setTimeout(res, 1000)); // Fake fetch

                form.setState({ isSubmitting: false }); // Set the form state (updates every component listening for state updates)
                form.setDefaultValues(form.values); // Set new default values
            }}
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
                    <FormInput type="radio" form={form} name="public" value={false} /> no
                    <FormInput type="radio" form={form} name="public" value={true} /> yes
                    <p>Using checkbox</p>
                    <FormInput type="checkbox" form={form} name="public" />
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
                    <p>Using radio buttons</p>
                    <FormInput type="radio" form={form} name="language" value="en" /> English
                    <FormInput type="radio" form={form} name="language" value="nl" /> Dutch
                    <FormInput type="radio" form={form} name="language" value="fr" /> French
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
                            { form, swap, remove, append } // <- Make sure to use the newly passed form (otherwise type checking will not work!)
                        ) => (
                            <VisualRender>
                                <ul>
                                    {form.values.map((
                                        _,
                                        i // You should use other key than index
                                    ) => (
                                        <TodoItem onMoveTop={() => swap(i, 0)} onRemove={() => remove(i)} key={i} parent={form} index={i} />
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
                                {/* <button
                                    type="button"
                                    onClick={() => {
                                        setValues([
                                            ...values,
                                            ...Array(50)
                                                .fill(0)
                                                .map((_, i) => ({
                                                    message: "Fix this " + i,
                                                    priority: "normal" as "normal" // Wut
                                                }))
                                        ]);
                                    }}
                                >
                                    Add 50 items
                                </button> */}
                            </VisualRender>
                        )}
                    />
                    <button type="button" onClick={() => form.setError("todos", "Not epic")}>
                        Yikes
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
                    <Listener form={form} name="description" render={({ value, setValue }) => <textarea rows={5} cols={50} value={value} onChange={(ev) => setValue(ev.target.value)}></textarea>} />
                    <hr />
                    <h3>
                        Author <small>string</small>
                    </h3>
                    <p>Togglable object field</p>
                    <FormInput form={form} name="author" type="checkbox" setNullOnUncheck value={{ name: "", age: 0 }} />
                    <ChildForm
                        form={form}
                        name="author"
                        render={(form) => (
                            <VisualRender>
                                <FormInput form={form} name="name" />
                                <FormInput form={form} name="age" type="number" />
                            </VisualRender>
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
                                <button style={{ fontSize: "1.3em" }} disabled={state.isSubmitting || !dirty}>
                                    Submit
                                </button>
                                <button style={{ fontSize: "1.3em" }} disabled={state.isSubmitting || !dirty} type="button" onClick={() => form.resetAll()}>
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
                            <input type="checkbox" defaultChecked={form.validateOnChange} onChange={(e) => (form.validateOnChange = e.target.checked)} />
                        </label>
                    </div>
                </div>
            </div>
        </form>
    );
}

function TodoItem(props: { parent: FormState<Todo[]>; index: number; onMoveTop: () => void; onRemove: () => void }) {
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
function FormValues<T>(props: { form: FormState<T> }) {
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
                        <input type="checkbox" checked={show.defaultValues} onChange={(ev) => setShow({ ...show, defaultValues: ev.target.checked })} />
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
function validateTodoList(values: ExampleFormData) {
    let todoErrors = values.todos.reduce((prev, val, index) => {
        if (val.message.length < 5) {
            prev[index] = { message: "Todo message should be longer!" };
        }
        return prev;
    }, [] as any[]);
    return {
        // author: values.author.length < 3 ? "Author name is too short." : undefined,
        name: values.name.length < 3 ? "Title is too short." : undefined,
        todos: todoErrors.length > 0 ? todoErrors : undefined
    };
}
