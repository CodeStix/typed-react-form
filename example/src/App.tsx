import React from "react";
import {
    Form,
    KeyOf,
    ObjectOrArray,
    useAnyListener,
    useChildForm,
    useForm,
    useListener
} from "fast-react-form";

function Input<T extends ObjectOrArray>(props: {
    form: Form<T>;
    name: KeyOf<T>;
}) {
    const val = useListener(props.form, props.name);

    return (
        <input
            value={val as string}
            onChange={(ev) =>
                props.form.setValue(props.name, ev.target.value as T[KeyOf<T>])
            }
        />
    );
}

function FormValues<T>(props: { form: Form<T> }) {
    const val = useAnyListener(props.form);

    return <code>{JSON.stringify(val.values, null, 2)}</code>;
}

interface User {
    firstName: string;
    lastName: string;
    info: UserInfo;
}

interface UserInfo {
    favoriteFood: string;
    intelligence: number;
}

export default function App() {
    const form = useForm<User>({
        firstName: "stijn",
        lastName: "rogiest",
        info: { favoriteFood: "pasta", intelligence: 128 }
    });

    return (
        <div
            style={{ padding: "1em", margin: "1em", border: "1px solid #0003" }}
        >
            <p>Firstname</p>
            <Input form={form} name="firstName" />
            <p>Lastname</p>
            <Input form={form} name="lastName" />
            <p>Info</p>
            <FormUserInfo parent={form} />
            <FormValues form={form} />
            <button
                onClick={() =>
                    form.setValues({
                        firstName: "code",
                        lastName: "stix",
                        info: {
                            favoriteFood: "asdfjkl",
                            intelligence: 1000
                        }
                    })
                }
            >
                Set values
            </button>
        </div>
    );
}

function FormUserInfo(props: { parent: Form<User> }) {
    const form = useChildForm(props.parent, "info");

    return (
        <div
            style={{ padding: "1em", margin: "1em", border: "1px solid #0003" }}
        >
            <p>Favorite food</p>
            <Input form={form} name="favoriteFood" />
            <p>Intelligence</p>
            <Input form={form} name="intelligence" />
            <FormValues form={form} />
            <button
                onClick={() =>
                    form.setValues({
                        favoriteFood: "asdfjkl",
                        intelligence: 1000
                    })
                }
            >
                Set values
            </button>
        </div>
    );
}
