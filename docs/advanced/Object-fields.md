---
layout: default
parent: Advanced
title: Object fields
---

# Object fields

To be able to create inputs for fields in objects, child form are used. You can create child forms using the `ObjectField` component or `useObjectField` hook.

-   [useObjectField](/typed-react-form/reference/useObjectField)
-   [ObjectField](/typed-react-form/reference/ObjectField)

This design choice makes complete type checking possible.

## Examples

✔️ **Object field using `ObjectField`**

```tsx
function PersonForm() {
    // Info object contains email and age
    const form = useForm({
        name: "John",
        info: { email: "john@example.com", age: 20 }
    });
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            {/* Input on root form */}
            <Field form={form} type="text" name="name" />
            <ObjectField
                form={form}
                name="info"
                render={(form) => (
                    <>
                        {/* Inputs on child form, use new form provided by the render function of ObjectField */}
                        <Field form={form} type="text" name="email" />
                        <Field form={form} type="number" name="age" />
                    </>
                )}
            />
            <button>Submit</button>
        </form>
    );
}
```

**✔️ `useObjectField` without seperate component**

```tsx
function PersonForm() {
    // Create root form
    const form = useForm({ name: "John", info: { email: "john@example.com", age: 20 } });
    // Create child form
    const personInfoForm = useObjectField(form, "info");
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            {/* Use root form */}
            <Field form={form} type="text" name="name" />
            {/* Use child form */}
            <Field form={personInfoForm} type="number" name="age" />
            <Field form={personInfoForm} type="text" name="email" />
            <button>Submit</button>
        </form>
    );
}
```

**✔️ `useObjectField` with seperate component**

```tsx
interface Person {
    name: string;
    info: PersonInfo;
}

interface PersonInfo {
    email: string;
    age: number;
}

function PersonForm() {
    // Create the root form
    const form = useForm({
        name: "John",
        info: { email: "john@example.com", age: 20 }
    });
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            <Field form={form} type="text" name="name" />
            {/* Pass form */}
            <PersonInfoForm parent={form} />
            <button>Submit</button>
        </form>
    );
}

function PersonInfoForm(props: { parent: FormState<Person> }) {
    // Create a new child form from the info field
    const form = useObjectField(props.parent, "info");
    return (
        <>
            <Field form={form} type="text" name="email" />
            <Field form={form} type="number" name="age" />
        </>
    );
}
```

**✔️ You can keep nesting children in children in children ....**

This is also possible with `ObjectField`.

```tsx
function PersonForm() {
    // Create root form
    const form = useForm({
        name: "John",
        info: {
            email: "john@example.com",
            moreInfo: {
                age: 20,
                moreMoreInfo: {
                    birthDate: new Date()
                }
            }
        }
    });
    // Create child form
    const personInfoForm = useObjectField(form, "info");
    // Create child form on child form
    const personMoreInfoForm = useObjectField(personInfoForm, "moreInfo");
    // Create child form on child form
    const personMoreMoreInfoForm = useObjectField(personMoreInfoForm, "moreMoreInfo"); // This is all type-checked!!
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            <Field form={form} type="text" name="name" />
            <Field form={personInfoForm} type="text" name="email" />
            <Field form={personMoreInfoForm} type="number" name="age" />
            <Field form={personMoreMoreInfoForm} type="date" name="birthDate" />
            <button>Submit</button>
        </form>
    );
}
```
