import { AnyListener, ArrayForm, ChildForm, ErrorMap, FormInput, FormSelect, FormTextArea, useForm } from "typed-react-form";
import tv, { SchemaType } from "typed-object-validator";
import React from "react";
import { VisualRender } from "./VisualRender";

// Example validation schema using typed-object-validator
const FormDataSchema = tv.object({
    text: tv.string().min(1).max(30),
    longText: tv.string(),
    enum: tv.value("option1").or(tv.value("option2")).or(tv.value("option3")),
    number: tv.number(),
    boolean: tv.boolean(),
    date: tv.date(),
    object: tv.object({
        childText: tv.string(),
        childNumber: tv.number()
    }),
    array: tv.array(tv.string()),
    objectArray: tv.array(
        tv.object({
            text: tv.string(),
            boolean: tv.boolean()
        })
    )
});
type FormData = SchemaType<typeof FormDataSchema>;

function validate(data: FormData) {
    return (FormDataSchema.validate(data) as ErrorMap<FormData, string>) ?? {};
}

export function ExampleForm() {
    // Initial values as first argument
    const form = useForm(
        {
            longText: "",
            text: "",
            number: 123,
            enum: "option1",
            boolean: false,
            object: { childText: "", childNumber: 0 },
            array: ["Item 1", "Item 2"],
            objectArray: [
                { boolean: true, text: "Item 1" },
                { boolean: false, text: "Item 2" }
            ]
        } as FormData,
        validate
    );

    function submit() {
        console.log(form.values);
    }

    return (
        <form
            onSubmit={form.handleSubmit(submit)}
            style={{ display: "grid", gridTemplateColumns: "125px 300px 1fr", width: "300px", margin: "2em", gap: "1em 2em", alignItems: "center" }}
        >
            {/* Show JSON representation */}
            <AnyListener
                form={form}
                render={() => (
                    <pre style={{ gridColumn: "span 3" }}>
                        <VisualRender>{JSON.stringify(form.values, null, 2)}</VisualRender>
                    </pre>
                )}
            />

            {/* A simple text input */}
            <label>Text</label>
            <FormInput form={form} name="text" />
            <pre>{`<FormInput form={form} name="fieldName" />`}</pre>

            {/* A textarea */}
            <label>Long text</label>
            <FormTextArea form={form} name="longText" />
            <pre>{`<FormTextArea form={form} name="fieldName" />`}</pre>

            {/* A number input */}
            <label>Number</label>
            <FormInput form={form} type="number" name="number" />
            <pre>{`<FormInput form={form} type="number" name="fieldName" />`}</pre>

            {/* A select input */}
            <label>Enum</label>
            <FormSelect form={form} name="enum">
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
            </FormSelect>
            <pre>{`
<FormSelect form={form} name="fieldName">
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
    <option value="option3">Option 3</option>
</FormSelect>
            `}</pre>

            {/* A checkbox input */}
            <label>Boolean</label>
            <FormInput form={form} type="checkbox" name="boolean" />
            <pre>{`<FormInput form={form} type="checkbox" name="fieldName" />`}</pre>

            {/* A radio input */}
            <label>Enum</label>
            <div>
                <label>
                    <FormInput form={form} type="radio" name="enum" value="option1" /> Option 1
                </label>
                <label>
                    <FormInput form={form} type="radio" name="enum" value="option2" /> Option 2
                </label>
                <label>
                    <FormInput form={form} type="radio" name="enum" value="option3" /> Option 3
                </label>
            </div>
            <pre>{`
<FormInput form={form} type="radio" name="fieldName" value="option1" /> Option 1
<FormInput form={form} type="radio" name="fieldName" value="option2" /> Option 2
<FormInput form={form} type="radio" name="fieldName" value="option3" /> Option 3
            `}</pre>

            {/* A date input */}
            <label>Date</label>
            <FormInput form={form} type="date" name="date" />
            <pre>{`<FormInput form={form} type="date" name="fieldName" />`}</pre>

            {/* A date timestamp input */}
            <label>Timestamp (number)</label>
            <FormInput form={form} type="date" name="number" dateAsNumber />
            <pre>{`<FormInput form={form} type="date" name="fieldName" dateAsNumber />`}</pre>

            {/* Toggle field */}
            <label>Toggle text</label>
            <div>
                <FormInput form={form} type="checkbox" name="text" setUndefinedOnUncheck value="" />
                <FormInput form={form} name="text" hideWhenNull />
            </div>
            <pre>
                {`
<FormInput form={form} type="checkbox" name="text" setUndefinedOnUncheck value="" />
<FormInput form={form} name="text" hideWhenNull />
            `}
            </pre>

            {/* Object field */}
            <label>Object field</label>
            <div>
                <ChildForm
                    form={form}
                    name="object"
                    render={(form) => (
                        <div style={{ background: "#0001" }}>
                            <p>Text</p>
                            <FormInput form={form} name="childText" />
                            <p>Number</p>
                            <FormInput form={form} name="childNumber" type="number" />
                        </div>
                    )}
                />
            </div>
            <pre>
                {`
<ChildForm
    form={form}
    name="parentObjectFieldName"
    render={(childForm) => (
        <div>
            <FormInput form={childForm} name="childFieldName" />
        </div>
)}
/>
            `}
            </pre>

            {/* Set object field to undefined on uncheck */}
            <label>Toggle object</label>
            <FormInput form={form} type="checkbox" name="object" setUndefinedOnUncheck value={{ childNumber: 0, childText: "" }} />
            <pre>
                {`
<FormInput 
    form={form} 
    type="checkbox" 
    name="fieldName" 
    setUndefinedOnUncheck 
    value={{ childDefaultFieldValue: "" }} 
/>      `}
            </pre>

            {/* Simple string array */}
            <label>String array</label>
            <ArrayForm
                form={form}
                name="array"
                render={({ form }) => (
                    <ul>
                        {form.values.map((_, i) => (
                            <li key={i}>
                                <FormInput form={form} name={i} />
                            </li>
                        ))}
                    </ul>
                )}
            />
            <pre>
                {`
<ArrayForm
    form={form}
    name="array"
    render={({ form }) => (
        <ul>
            {form.values.map((_, i) => (
                <li key={i}>
                    <FormInput form={form} name={i} />
                </li>
            ))}
        </ul>
    )}
/>`}
            </pre>

            {/* Dynamic string array */}
            <label>Dynamic string array</label>
            <ArrayForm
                form={form}
                name="array"
                render={({ form, append, remove }) => (
                    <ul>
                        {form.values.map((_, i) => (
                            <li key={i}>
                                <FormInput form={form} name={i} />
                                <button onClick={() => remove(i)}>Remove</button>
                            </li>
                        ))}
                        <button type="button" onClick={() => append("")}>
                            Add
                        </button>
                    </ul>
                )}
            />
            <pre>
                {`
<ArrayForm
    form={form}
    name="arrayFieldName"
    render={({ form, append, remove }) => (
        <div>
            <ul>
                {form.values.map((_, i) => (
                    <li key={i}>
                        <FormInput form={form} name={i} />
                        <button onClick={() => remove(i)}>Remove</button>
                    </li>
                ))}
            </ul>
            <button type="button" onClick={() => append("")}>
                Add
            </button>
        </div>
    )}
/> `}
            </pre>

            {/* Object array */}
            <label>Object array</label>
            <ArrayForm
                form={form}
                name="objectArray"
                render={({ form }) => (
                    <ul>
                        {form.values.map((_, i) => (
                            <ChildForm
                                form={form}
                                name={i}
                                render={(form) => (
                                    <div>
                                        <FormInput form={form} name="text" />
                                        <FormInput form={form} name="boolean" type="checkbox" />
                                    </div>
                                )}
                            />
                        ))}
                    </ul>
                )}
            />
            <pre>
                {`
<ArrayForm
    form={form}
    name="objectArrayField"
    render={({ form }) => (
        <ul>
            {form.values.map((_, i) => (
                <ChildForm
                    form={form}
                    name={i}
                    render={(form) => (
                        <div>
                            <FormInput form={form} name="objectFieldName" />
                        </div>
                    )}
                />
            ))}
        </ul>
    )}
/> `}
            </pre>

            {/* Dynamic object array */}
            <label>Dynamic object array</label>
            <ArrayForm
                form={form}
                name="objectArray"
                render={({ form, append, remove }) => (
                    <ul>
                        {form.values.map((_, i) => (
                            <ChildForm
                                form={form}
                                name={i}
                                render={(form) => (
                                    <div>
                                        <FormInput form={form} name="text" />
                                        <FormInput form={form} name="boolean" type="checkbox" />
                                        <button type="button" onClick={() => remove(i)}>
                                            Remove
                                        </button>
                                    </div>
                                )}
                            />
                        ))}
                        <button type="button" onClick={() => append({ text: "", boolean: false })}>
                            Add item
                        </button>
                    </ul>
                )}
            />
            <pre>
                {`
<ArrayForm
    form={form}
    name="objectArrayField"
    render={({ form, append, remove }) => (
        <ul>
            {form.values.map((_, i) => (
                <ChildForm
                    form={form}
                    name={i}
                    render={(form) => (
                        <div>
                            <FormInput form={form} name="objectFieldName" />
                            <button type="button" onClick={() => remove(i)}>
                                Remove
                            </button>
                        </div>
                    )}
                />
            ))}
            <button type="button" onClick={() => append({ objectFieldName: "default value" })}>
                Add item
            </button>
        </ul>
    )}
/>`}
            </pre>
        </form>
    );
}
