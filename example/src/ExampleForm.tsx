import { AnyListener, ChildForm, ErrorMap, FormInput, FormSelect, FormTextArea, useForm } from "typed-react-form";
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
    })
});
type FormData = SchemaType<typeof FormDataSchema>;

function validate(data: FormData) {
    return (FormDataSchema.validate(data) as ErrorMap<FormData, string>) ?? {};
}

export function ExampleForm() {
    // Initial values as first argument
    const form = useForm(
        { longText: "", text: "", number: 123, enum: "option1", boolean: false, object: { childText: "", childNumber: 0 } } as FormData,
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
            <pre>{`
<FormInput form={form} type="checkbox" name="text" setUndefinedOnUncheck value="" />
<FormInput form={form} name="text" hideWhenNull />
            `}</pre>

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
            <pre>{`
<ChildForm
    form={form}
    name="parentObjectFieldName"
    render={(childForm) => (
        <div>
            <FormInput form={childForm} name="childFieldName" />
        </div>
)}
/>
            `}</pre>

            {/* Set object field to undefined on uncheck */}
            <label>Toggle object</label>
            <FormInput form={form} type="checkbox" name="object" setUndefinedOnUncheck value={{ childNumber: 0, childText: "" }} />
            <pre>{`
<FormInput 
    form={form} 
    type="checkbox" 
    name="fieldName" 
    setUndefinedOnUncheck 
    value={{ childDefaultFieldValue: "" }} 
/>      `}</pre>
        </form>
    );
}
