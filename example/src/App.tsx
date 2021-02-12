import React, { useState } from "react";
import {
    AnyListener,
    ArrayListener,
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
    ChildFormState
} from "typed-react-form";
import { VisualRender } from "./VisualRender";

interface User {
    name: string;
    birthDate: number;
}

interface TodoList {
    id: number;
    name: string;
    description: string;
    author?: User;
    public: boolean;
    date: number;
    dateObject: Date;
    tags: string[];
    todos: Todo[];
}

interface Todo {
    id: number;
    message: string;
    priority: "low" | "normal" | "high";
}

export default function App() {
    const [values, setValues] = useState<TodoList>({
        date: new Date().getTime(),
        dateObject: new Date(),
        description: "this is a testing form",
        id: Math.ceil(Math.random() * 100000),
        public: true,
        tags: ["test"],
        name: "My todo list",
        todos: Array(3)
            .fill(0)
            .map((_, i) => ({
                message: "Fix this " + i,
                priority: "normal",
                id: i
            }))
    });

    const form = useForm(
        values, // <- Default values, may change
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

                setValues({ ...form.values }); // Set new default values, (form.setDefaultValues(...) is also possible instead of useState/useForm combo!)
            }}
            style={{ padding: "1em", margin: "1em" }}
        >
            <h1>
                Form created using <a href="https://github.com/CodeStix/typed-react-form">typed-react-form</a>
            </h1>
            <p>
                The <strong>red flash</strong> indicates which parts of the form are being rerendered. The <strong>gray outline</strong> indicates that a field is dirty (modified).{" "}
                <strong>Red outline</strong> indicates error.
            </p>
            <hr />
            <div style={{ display: "grid", gridTemplateColumns: "50% 50%", gridTemplateRows: "100%", gap: "2em" }}>
                <VisualRender>
                    <h2>Todo list example form</h2>
                    <h3>
                        Id <small>number</small>
                    </h3>
                    <FormInput type="number" form={form} name="id" />
                    <h3>
                        Name <small>string</small>
                    </h3>
                    <FormInput form={form} name="name" />
                    <FormError form={form} name="name" />
                    <h3>
                        Public? <small>boolean</small>
                    </h3>
                    <p>Using radio buttons</p>
                    <FormInput type="radio" form={form} name="public" value={false} /> no
                    <FormInput type="radio" form={form} name="public" value={true} /> yes
                    <p>Using checkbox</p>
                    <FormInput type="checkbox" form={form} name="public" />
                    <h3>
                        Todo's <small>array</small>
                    </h3>
                    {/* Use ArrayForm (wrapper around useArrayForm) to create dynamic forms */}
                    <ArrayListener parent={form} name="todos">
                        {(
                            { form, swap, remove, append } // <- Make sure to use the newly passed form (otherwise type checking will not work!)
                        ) => (
                            <VisualRender>
                                <ul>
                                    {form.values.map((e, i) => (
                                        <TodoItem onMoveTop={() => swap(i, 0)} onRemove={() => remove(i)} key={e.id} parent={form} index={i} />
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
                    </ArrayListener>
                    <h3>
                        Date <small>timestamp number</small>
                    </h3>
                    <FormInput type="date" form={form} name="date" dateAsNumber />
                    <h3>
                        Date <small>date object</small>
                    </h3>
                    <FormInput type="date" form={form} name="dateObject" />
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
                    <Listener form={form} name="description">
                        {({ value, setValue }) => <textarea rows={5} cols={50} value={value} onChange={(ev) => setValue(ev.target.value)}></textarea>}
                    </Listener>
                    <h3>
                        Author <small>string</small>
                    </h3>
                    <p>Using custom input component</p>
                    <ChildForm parent={form} name="author">
                        {(form) => (
                            <>
                                <Listener form={form} name="">
                                    {() => {}}
                                </Listener>
                                <FormInput form={form} name="" />
                            </>
                        )}
                    </ChildForm>
                    <Listener form={form} name="author">
                        {({ value }) => null}
                    </Listener>
                    <FormInput form={form} name="author" type="checkbox" setUndefinedOnUncheck value={{ name: "new", birthDate: new Date().getTime() }} />
                </VisualRender>
                <div style={{ position: "sticky", top: "0", height: "500px" }}>
                    <h2>Output</h2>
                    <FormValues form={form} />

                    {/* Disable buttons when form is submitting or when nothing has changed, the AnyListener wrapper is required */}
                    <AnyListener form={form}>
                        {({ state, dirty }) => (
                            <div style={{ margin: "0.5em 0" }}>
                                <button style={{ fontSize: "1.3em" }} disabled={state.isSubmitting || !dirty}>
                                    Submit
                                </button>
                                <button style={{ fontSize: "1.3em" }} disabled={state.isSubmitting || !dirty} type="button" onClick={() => form.resetAll()}>
                                    Reset
                                </button>
                            </div>
                        )}
                    </AnyListener>

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
function validateTodoList(values: TodoList) {
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
