import React, { useState } from "react";
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
    const { value, dirty, defaultValue, error } = useListener(
        props.form,
        props.name
    );

    return (
        <input
            placeholder={defaultValue}
            style={{
                background: dirty ? "#eee" : "#fff",
                padding: "0.3em",
                fontSize: "inherit",
                border: error ? "1px solid red" : "1px solid gray"
            }}
            value={value as string}
            onChange={(ev) =>
                props.form.setValue(props.name, ev.target.value as T[KeyOf<T>])
            }
        />
    );
}

function FormValues<T>(props: { form: Form<T> }) {
    const val = useAnyListener(props.form);

    return (
        <div>
            <pre>{JSON.stringify(val.values, null, 2)}</pre>
            <pre>{JSON.stringify(val.errorMap, null, 2)}</pre>
            <pre>{JSON.stringify(val.dirtyListener.values, null, 2)}</pre>
            {val.dirty && (
                <p>
                    <strong>DIRTY</strong>
                </p>
            )}
        </div>
    );
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
    const [values, setValues] = useState<User>({
        firstName: "stijn",
        lastName: "rogiest",
        info: { favoriteFood: "pasta", intelligence: 128 }
    });

    const form = useForm<User>(values);

    return (
        <form
            onSubmit={async (ev) => {
                ev.preventDefault();
                console.log("submitting");
                await new Promise((res) => setTimeout(res, 500));
                console.log("submitted");
                setValues({ ...form.values });
            }}
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
                type="button"
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
            <button type="button" onClick={() => form.resetAll()}>
                Reset
            </button>
            <button>Submit</button>
        </form>
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
                type="button"
                onClick={() => {
                    form.setError(
                        "favoriteFood",
                        form.errorMap.favoriteFood ? null : "not ok"
                    );
                }}
            >
                Toggle error
            </button>
        </div>
    );
}
