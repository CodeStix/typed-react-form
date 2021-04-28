import { AnyListener, ArrayField, ObjectField, ErrorMap, Field, useForm } from "typed-react-form";
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
    tags: tv.array(tv.value("food").or(tv.value("tech").or(tv.value("sports")))),
    object: tv.object({
        childText: tv.string(),
        childNumber: tv.number()
    }),
    array: tv.array(tv.string()),
    customText: tv.string(),
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
            customText: "nice",
            number: 123,
            enum: "option1",
            boolean: false,
            object: { childText: "", childNumber: 0 },
            date: new Date(),
            array: ["Item 1", "Item 2"],
            objectArray: [
                { boolean: true, text: "Item 1" },
                { boolean: false, text: "Item 2" }
            ],
            tags: ["food"]
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
            <Field form={form} name="text" />
            <pre>{`<Field form={form} name="fieldName" />`}</pre>

            {/* A simple text input */}
            <label>Deserializer text</label>
            <Field form={form} name="customText" serializer={(e) => e?.toLowerCase()} deserializer={(e) => (e as string).toUpperCase()} />
            <pre>{`<Field form={form} name="fieldName" />`}</pre>

            {/* A textarea */}
            <label>Long text</label>
            <Field form={form} name="longText" as="textarea" />
            <pre>{`<Field as="textarea" form={form} name="fieldName" />`}</pre>

            {/* A number input */}
            <label>Number</label>
            <Field form={form} type="number" name="number" />
            <pre>{`<Field form={form} type="number" name="fieldName" />`}</pre>

            {/* A select input */}
            <label>Enum</label>
            <Field form={form} as="select" name="enum">
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
            </Field>
            <pre>{`
<Field as="select" form={form} name="fieldName">
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
    <option value="option3">Option 3</option>
</Field>
            `}</pre>

            {/* A checkbox input */}
            <label>Boolean</label>
            <Field form={form} type="checkbox" name="boolean" />
            <pre>{`<Field form={form} type="checkbox" name="fieldName" />`}</pre>

            <label>Tags</label>
            <div>
                <label>
                    Food
                    <Field form={form} type="checkbox" name="tags" value="food" />
                </label>
                <label>
                    Sports
                    <Field form={form} type="checkbox" name="tags" value="sports" />
                </label>
                <label>
                    Tech
                    <Field form={form} type="checkbox" name="tags" value="tech" />
                </label>
            </div>
            <pre>{`<Field form={form} type="checkbox" name="fieldName" />`}</pre>

            {/* A radio input */}
            <label>Enum</label>
            <div>
                <label>
                    <Field form={form} type="radio" name="enum" value="option1" /> Option 1
                </label>
                <label>
                    <Field form={form} type="radio" name="enum" value="option2" /> Option 2
                </label>
                <label>
                    <Field form={form} type="radio" name="enum" value="option3" /> Option 3
                </label>
            </div>
            <pre>{`
<Field form={form} type="radio" name="fieldName" value="option1" /> Option 1
<Field form={form} type="radio" name="fieldName" value="option2" /> Option 2
<Field form={form} type="radio" name="fieldName" value="option3" /> Option 3
            `}</pre>

            {/* A date input */}
            <label>Date</label>
            <Field form={form} type="date" name="date" />
            <pre>{`<Field form={form} type="date" name="fieldName" />`}</pre>

            {/* A date timestamp input */}
            <label>Timestamp (number)</label>
            <Field form={form} type="date" name="number" dateAsNumber />
            <pre>{`<Field form={form} type="date" name="fieldName" dateAsNumber />`}</pre>

            {/* Toggle field */}
            <label>Toggle text</label>
            <div>
                <Field form={form} type="checkbox" name="text" setUndefinedOnUncheck value="" />
                <Field form={form} name="text" hideWhenNull />
            </div>
            <pre>
                {`
<Field form={form} type="checkbox" name="text" setUndefinedOnUncheck value="" />
<Field form={form} name="text" hideWhenNull />
            `}
            </pre>

            {/* Object field */}
            <label>Object field</label>
            <div>
                <ObjectField
                    form={form}
                    name="object"
                    render={(form) => (
                        <div style={{ background: "#0001" }}>
                            <p>Text</p>
                            <Field form={form} name="childText" />
                            <p>Number</p>
                            <Field form={form} name="childNumber" type="number" />
                        </div>
                    )}
                />
            </div>
            <pre>
                {`
<ObjectField
    form={form}
    name="parentObjectFieldName"
    render={(childForm) => (
        <div>
            <Field form={childForm} name="childFieldName" />
        </div>
)}
/>
            `}
            </pre>

            {/* Set object field to undefined on uncheck */}
            <label>Toggle object</label>
            <Field form={form} type="checkbox" name="object" setUndefinedOnUncheck value={{ childNumber: 0, childText: "" }} />
            <pre>
                {`
<Field 
    form={form} 
    type="checkbox" 
    name="fieldName" 
    setUndefinedOnUncheck 
    value={{ childDefaultFieldValue: "" }} 
/>      `}
            </pre>

            {/* Simple string array */}
            <label>String array</label>
            <ArrayField
                form={form}
                name="array"
                render={({ form }) => (
                    <ul>
                        {form.values.map((_, i) => (
                            <li key={i}>
                                <Field form={form} name={i} />
                            </li>
                        ))}
                    </ul>
                )}
            />
            <pre>
                {`
<ArrayField
    form={form}
    name="array"
    render={({ form }) => (
        <ul>
            {form.values.map((_, i) => (
                <li key={i}>
                    <Field form={form} name={i} />
                </li>
            ))}
        </ul>
    )}
/>`}
            </pre>

            {/* Dynamic string array */}
            <label>Dynamic string array</label>
            <ArrayField
                form={form}
                name="array"
                render={({ form, append, remove }) => (
                    <ul>
                        {form.values.map((_, i) => (
                            <li key={i}>
                                <Field form={form} name={i} />
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
<ArrayField
    form={form}
    name="arrayFieldName"
    render={({ form, append, remove }) => (
        <div>
            <ul>
                {form.values.map((_, i) => (
                    <li key={i}>
                        <Field form={form} name={i} />
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
            <ArrayField
                form={form}
                name="objectArray"
                render={({ form }) => (
                    <ul>
                        {form.values.map((_, i) => (
                            <ObjectField
                                form={form}
                                name={i}
                                render={(form) => (
                                    <div>
                                        <Field form={form} name="text" />
                                        <Field form={form} name="boolean" type="checkbox" />
                                    </div>
                                )}
                            />
                        ))}
                    </ul>
                )}
            />
            <pre>
                {`
<ArrayField
    form={form}
    name="objectArrayField"
    render={({ form }) => (
        <ul>
            {form.values.map((_, i) => (
                <ObjectField
                    form={form}
                    name={i}
                    render={(form) => (
                        <div>
                            <Field form={form} name="objectFieldName" />
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
            <ArrayField
                form={form}
                name="objectArray"
                render={({ form, append, remove }) => (
                    <ul>
                        {form.values.map((_, i) => (
                            <ObjectField
                                form={form}
                                name={i}
                                render={(form) => (
                                    <div>
                                        <Field form={form} name="text" />
                                        <Field form={form} name="boolean" type="checkbox" />
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
<ArrayField
    form={form}
    name="objectArrayField"
    render={({ form, append, remove }) => (
        <ul>
            {form.values.map((_, i) => (
                <ObjectField
                    form={form}
                    name={i}
                    render={(form) => (
                        <div>
                            <Field form={form} name="objectFieldName" />
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
