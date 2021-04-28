---
layout: default
parent: Advanced
title: Array fields
---

# Array fields

To create dynamic array fields, you should use the [`ArrayField`](/typed-react-form/reference/ArrayField) component or [`useArrayField`](/typed-react-form/useArrayField) hook. These are wrappers around [`useObjectField`](/typed-react-form/reference/useObjectField) which provide useful functions and optimizations for arrays.

-   [ArrayField](/typed-react-form/reference/ArrayField)
-   [useArrayField](/typed-react-form/reference/useArrayField)

If you have an array field with a constant size, you should probably just use [`ObjectField`](/typed-react-form/reference/ObjectField). (See bottom for examples)

**Note on keys**: you **should** use the index as key, this seems against nature at first, but remember that this library does not rerender each time something in the array changes. When 2 array items get swapped, it does not rerender either, only when the array size changes, it rerenders. For this reason, it is not a problem (and it's recommended) to use index as the key. (This can change in the future)

## Dynamic array examples

✔️ **Dynamic string array field using `ArrayField`**

```tsx
function NotesList() {
    const form = useForm({
        notes: ["Do the dishes", "Go outside", "Drink some water"]
    });
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            <ArrayField
                form={form}
                name="notes"
                render={({ form, values, append, remove }) => (
                    <>
                        {/* You SHOULD use index as key. See top for info. */}
                        {values.map((_, i) => (
                            <div key={i}>
                                <Field form={form} name={i} />
                                <button type="button" onClick={() => remove(i)}>
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={() => append("New note")}>
                            Add note
                        </button>
                    </>
                )}
            />
            <button>Submit</button>
        </form>
    );
}
```

✔️ **Dynamic object array field using `ArrayField`**

Remember: this is all type checked!

```tsx
function ShoppingListForm() {
    const form = useForm({
        title: "My shopping list",
        items: [{ name: "Coffee", amount: 1 }]
    });

    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            <h2>Title</h2>
            <Field form={form} type="text" name="title" />

            {/* Create an array child form for the 'items' field */}
            <h2>Items</h2>
            <ArrayField
                form={form}
                name="items"
                render={({ form, values, append, remove }) => (
                    <>
                        {/* This only rerenders when the whole array changes. */}

                        {values.map((_, i) => (
                            // Create a child form for each item in the array, because each array item is an object.
                            <ObjectField
                                key={i} // You should index as key
                                form={form} // Pass the parent form
                                name={i} // Pass the current index as the name
                                render={(form) => (
                                    <div>
                                        {/* Everything here is type-checked! */}
                                        <Field form={form} type="text" name="name" />
                                        <Field form={form} type="number" name="amount" />
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
```

✔️ **Dynamic object array field with seperate component for each child form and using `useArrayField`**

```tsx
interface ShoppingListItem {
    name: string;
    amount: number;
}
interface ShoppingList {
    title: string;
    items: ShoppingListItem[];
}

function ShoppingListForm() {
    const form =
        useForm <
        ShoppingList >
        {
            title: "My shopping list",
            items: [{ name: "Coffee", amount: 1 }]
        };
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            <h2>Title</h2>
            <Field form={form} type="text" name="title" />
            <h2>Items</h2>
            <ShoppingListItemsForm parent={form} />
            <button>Submit</button>
        </form>
    );
}

function ShoppingListItemsForm(props: { parent: FormState<ShoppingList> }) {
    const { form, values, append, remove } = useArrayField(props.parent, "items");
    // This component only rerenders when the whole array changes.
    return (
        <>
            {values.map((_, i) => (
                <ShoppingListItemForm parent={form} index={i} key={i} remove={remove} />
            ))}
            <button type="button" onClick={() => append({ name: "", amount: 1 })}>
                Add item
            </button>
        </>
    );
}

function ShoppingListItemForm(props: { parent: FormState<ShoppingListItem[]>; index: number; remove: (i: number) => void }) {
    const form = useObjectField(props.parent, props.index);
    return (
        <div>
            <Field form={form} type="text" name="name" />
            <Field form={form} type="number" name="amount" />
            <button type="button" onClick={() => props.remove(props.index)}>
                Remove
            </button>
        </div>
    );
}
```

## Fixed array example

A fixed array always has the same size, [`ObjectField`](/typed-react-form/reference/ObjectField) is used, and the index into the array is given using the name prop.

✔️ **Fixed array field containing strings**

```tsx
function AnswerForm() {
    const form = useForm({
        // Always 3 items in array
        answers: ["", "", ""]
    });
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                console.log("submit", form.values);
            }}
        >
            <ObjectField
                parent={form}
                name="answers"
                render={(form) => (
                    <div>
                        {/* Use array index as field name */}
                        <p>Answer 1</p>
                        <Field form={form} name={0} type="text" />
                        <p>Answer 2</p>
                        <Field form={form} name={1} type="text" />
                        <p>Answer 3</p>
                        <Field form={form} name={2} type="text" />
                    </div>
                )}
            />
            <button>Submit</button>
        </form>
    );
}
```
