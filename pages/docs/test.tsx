import React from "react";
import {
    AnyListener,
    FormInput,
    useForm,
    ArrayForm,
    ChildForm,
    FormState,
    useAnyListener,
    ErrorMap,
    FormError,
} from "typed-react-form";

function MyForm() {
    const form = useForm({ email: "" });

    function submit() {
        // The form.handleSubmit validates the form before calling this function
        console.log("submit", form.values);
    }

    // Use the standard html form element, which exposes the onSubmit event.
    return (
        <form onSubmit={form.handleSubmit(submit)}>
            {/* Make sure to add type="submit" */}
            <button type="submit">Submit!</button>
        </form>
    );
}

function MyForm2() {
    const form = useForm({ email: "", password: "" });

    async function submit() {
        // Implement your submit logic here...
        console.log("submitting", form.values);
        // Fake fetch, by waiting for 500ms
        await new Promise((res) => setTimeout(res, 500));
        // Optional: set new default values
        form.setDefaultValues(form.values);
    }

    return (
        <form onSubmit={form.handleSubmit(submit)}>
            {/* Make sure to pass the form prop! */}
            <FormInput form={form} name="email" type="text" />
            <FormInput form={form} name="password" type="password" />
            <button type="submit">Submit!</button>
        </form>
    );
}

function ShoppingListForm() {
    const form = useForm({
        title: "My shopping list",
        items: [{ name: "Coffee", amount: 1 }],
    });

    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            <h2>Title</h2>
            <FormInput form={form} type="text" name="title" />

            {/* Create an array child form for the 'items' field */}
            <h2>Items</h2>
            <ArrayForm
                form={form}
                name="items"
                render={({ form, values, append, remove }) => (
                    <>
                        {/* This only rerenders when the whole array changes. */}

                        {values.map((_, i) => (
                            // Create a child form for each item in the array, because each array item is an object.
                            <ChildForm
                                key={i} // You should index as key
                                form={form} // Pass the parent form
                                name={i} // Pass the current index as the name
                                render={(form) => (
                                    <div>
                                        {/* Everything here is type-checked! */}
                                        <FormInput form={form} type="text" name="name" />
                                        <FormInput form={form} type="number" name="amount" />
                                        <button type="button" onClick={() => remove(i)}>
                                            Remove
                                        </button>
                                    </div>
                                )}
                            />
                        ))}

                        {/* Use the append helper function to add an item to the array */}
                        <button type="button" onClick={() => append({ name: "", amount: 1 })}>
                            Add item
                        </button>
                    </>
                )}
            />
            <button>Submit</button>
        </form>
    );
}

function ToggleExample() {
    const form = useForm({
        name: "codestix",
        location: { long: 123, lat: 456 }, // Object field
    });
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            <FormInput form={form} name="name" type="text" />

            {/* Use the setNullOnUncheck prop. The value prop contains the value that is set when the box gets checked again, you can omit it to use the default value */}
            <FormInput form={form} name="location" type="checkbox" setNullOnUncheck />
            {/* ChildForm hides its contents when null/undefined by default */}
            <ChildForm
                form={form}
                name="location"
                render={(form) => (
                    <>
                        <p>Location lat/long</p>
                        <FormInput form={form} name="lat" type="number" />
                        <FormInput form={form} name="long" type="number" />
                    </>
                )}
            />
            <button>Submit</button>
        </form>
    );
}

// Take a form containing any values
function FormJson(props: { form: FormState<any> }) {
    // Listen for all changes on the form
    const { values } = useAnyListener(props.form);
    // Show the json representation of the values in the form
    return <pre>{JSON.stringify(values, null, 2)}</pre>;
}

// Usage
function FormJsonExample() {
    const form = useForm({ name: "John", age: 19 });
    return (
        <form
            style={{ margin: "1em" }}
            onSubmit={async (ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            <FormInput form={form} name="name" />
            <FormInput type="number" form={form} name="age" />
            {/* Use your component, pass the form */}
            <FormJson form={form} />
            {/* Using AnyListener, provides the same functionality */}
            <AnyListener form={form} render={({ values }) => <pre>{JSON.stringify(values, null, 2)}</pre>} />
            <button>Submit</button>
        </form>
    );
}

interface LoginRequest {
    email: string;
    password: string;
}

// May be async if needed
function loginValidator(values: LoginRequest): ErrorMap<LoginRequest, string> {
    // Example validator logic, the returned error object should follow the same structure as the values object.
    return {
        email: values.email.length < 10 ? "Email must be longer" : undefined,
        password: values.password.length < 5 ? "Password must be longer" : undefined,
    };
}

function ValidationExample() {
    const form = useForm<LoginRequest>(
        { email: "", password: "" },
        loginValidator, // Pass loginValidator to useForm
        true, // Validate on change (false by default)
        false // Validate on mount (false by default)
    );
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            <FormInput form={form} name="email" type="email" />
            <FormError form={form} name="email" />
            <FormInput form={form} name="password" type="password" />
            <FormError form={form} name="password" />
            {/* Listen for any change on the form, and disable the submit button when there is an error */}
            <AnyListener form={form} render={(form) => <button disabled={form.error}>Submit</button>} />
        </form>
    );
}

export default function Testing() {
    return (
        <>
            <MyForm />
            <hr />
            <MyForm2 />
            <hr />
            <ShoppingListForm />
            <hr />
            <ToggleExample />
            <hr />
            <FormJsonExample />
            <hr />
            <ValidationExample />
        </>
    );
}
