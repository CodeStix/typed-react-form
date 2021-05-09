import React from "react";
import { AnyListener, ArrayField, Field, FormState, useObjectField, useForm, useListener } from "typed-react-form";

interface Apple {
    type: "apple";
    color: string;
}

interface Bread {
    type: "bread";
    size: number;
}

type FormDataObject = Apple | Bread;

interface FormData {
    objects: FormDataObject[];
}

export default function OneOfObjectArrayForm() {
    const form = useForm<FormData>({
        objects: [
            { type: "apple", color: "#ff0000" },
            { type: "bread", size: 200 }
        ]
    });
    return (
        <form
            style={{ margin: "0.5em" }}
            onReset={() => form.resetAll()}
            onSubmit={async (ev) => {
                // Prevent the submit button from reloading the page
                ev.preventDefault();
                // Disable inputs and fake submit...
                form.setState({ isSubmitting: true });
                await new Promise((res) => setTimeout(res, 500));
                form.setState({ isSubmitting: false });
                console.log(form.values);
                form.setValues(form.values);
            }}
        >
            <a href="https://github.com/CodeStix/typed-react-form/blob/master/example/src/OneOfObjectArrayForm.tsx">View source code</a>
            <ArrayField
                form={form}
                name="objects"
                render={({ form, values, append, remove }) => (
                    <>
                        <ul>
                            {values.map((_, i) => (
                                // Use index as key
                                <li key={i}>
                                    {/* Make sure to use the form given by <ArrayField />! */}
                                    <BreadOrAppleForm parent={form} index={i} remove={() => remove(i)} />
                                </li>
                            ))}
                        </ul>
                        <hr />
                        <button type="button" onClick={() => append({ type: "apple", color: "#ff0000" })}>
                            Add Apple
                        </button>
                        <button type="button" onClick={() => append({ type: "bread", size: 200 })}>
                            Add Bread
                        </button>
                    </>
                )}
            />
            <AnyListener
                form={form}
                render={({ values, dirty }) => (
                    <pre>
                        {dirty ? "MODIFIED" : "UNMODIFIED"}
                        <br />
                        {JSON.stringify(values, null, 2)}
                    </pre>
                )}
            />
            <button>Submit!</button>
            <button type="reset">Reset</button>
        </form>
    );
}

function BreadOrAppleForm(props: { parent: FormState<FormDataObject[]>; index: number; remove: () => void }) {
    // Create a new child form with the array as the parent and index as the key
    const form = useObjectField(props.parent, props.index);
    // Listen for changes on the 'type' field, which contains 'apple' or 'bread'. This component will rerender when it changes
    const { value: type } = useListener(form, "type");
    return (
        <div style={{ background: "#0001", padding: "1em", margin: "1em" }}>
            {/* A select input that sets new form values when a new object type (apple or bread) was chosen */}
            <label>Object type: </label>
            <select
                value={type}
                onChange={(ev) => {
                    if (ev.target.value === "apple") form.setValues({ type: "apple", color: "red" });
                    else if (ev.target.value === "bread") form.setValues({ type: "bread", size: 200 });
                }}
            >
                <option value="apple">Apple</option>
                <option value="bread">Bread</option>
            </select>

            {/* Render AppleForm when the type is 'apple'. When type is 'bread', render BreadForm */}
            {type === "apple" ? <AppleForm form={form as FormState<Apple>} /> : <BreadForm form={form as FormState<Bread>} />}

            {/* Remove this item from the list */}
            <button type="button" onClick={() => props.remove()}>
                Remove
            </button>
        </div>
    );
}

function AppleForm({ form }: { form: FormState<Apple> }) {
    return (
        <div>
            <h4>Apple editor</h4>
            <p>Select the color of your apple</p>
            <Field form={form} type="color" name="color" />
        </div>
    );
}

function BreadForm({ form }: { form: FormState<Bread> }) {
    return (
        <div>
            <h4>Bread editor</h4>
            <p>Select the size of your bread</p>
            <Field form={form} type="number" name="size" />
        </div>
    );
}
