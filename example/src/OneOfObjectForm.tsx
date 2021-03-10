import React from "react";
import { AnyListener, FormInput, FormState, Listener, useChildForm, useForm } from "typed-react-form";

interface Apple {
    type: "apple";
    color: string;
}

interface Bread {
    type: "bread";
    size: number;
}

interface FormData {
    object: Apple | Bread;
}

export default function OneOfObjectArrayForm() {
    const form = useForm<FormData>({
        object: { type: "apple", color: "#ff0000" } // or { type: "bread", size: 200 }
    });
    return (
        <form
            style={{ margin: "0.5em" }}
            onReset={() => form.resetAll()}
            onSubmit={async (ev) => {
                ev.preventDefault();
                form.setState({ isSubmitting: true });
                await new Promise((res) => setTimeout(res, 500));
                form.setState({ isSubmitting: false });
                console.log(form.values);
                form.setDefaultValues(form.values);
            }}
        >
            <AppleOrBreadForm parent={form} />
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

function AppleOrBreadForm(props: { parent: FormState<FormData> }) {
    const form = useChildForm(props.parent, "object");
    return (
        <div style={{ background: "#0001", padding: "1em", margin: "1em" }}>
            <label>Object type: </label>
            {/* You can also use the useListener hook instead */}
            <Listener
                form={form}
                name="type"
                render={({ value }) => (
                    <>
                        <select
                            value={value}
                            onChange={(ev) => {
                                if (ev.target.value === "apple") form.setValues({ type: "apple", color: "#ff0000" });
                                else if (ev.target.value === "bread") form.setValues({ type: "bread", size: 200 });
                            }}
                        >
                            <option value="apple">Apple</option>
                            <option value="bread">Bread</option>
                        </select>

                        {/* Render AppleForm when the type is 'apple'. When type is 'bread', render BreadForm */}
                        {value === "apple" ? <AppleForm form={form as FormState<Apple>} /> : <BreadForm form={form as FormState<Bread>} />}
                    </>
                )}
            />
        </div>
    );
}

function AppleForm({ form }: { form: FormState<Apple> }) {
    return (
        <div>
            <h4>Apple editor</h4>
            <p>Select the color of your apple</p>
            <FormInput form={form} type="color" name="color" />
        </div>
    );
}

function BreadForm({ form }: { form: FormState<Bread> }) {
    return (
        <div>
            <h4>Bread editor</h4>
            <p>Select the size of your bread</p>
            <FormInput form={form} type="number" name="size" />
        </div>
    );
}
