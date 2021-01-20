import React, { useState } from 'react'
import {
    AnyListener,
    ArrayField,
    ChildForm,
    FormState,
    Listener,
    useForm
} from './StateForm'

function FormVisualize<T>(props: { form: FormState<T> }) {
    return (
        <AnyListener
            form={props.form}
            render={({ values }) => (
                <div style={{ background: '#eee' }}>
                    <pre>{JSON.stringify(values, null, 2)}</pre>
                    {props.form.isDirty && (
                        <p>
                            <strong>DIRTY</strong>
                        </p>
                    )}
                    <pre>
                        {JSON.stringify(props.form.values)}{' '}
                        {JSON.stringify(props.form.defaultValues)}
                    </pre>
                </div>
            )}
        />
    )
}

export default function App() {
    const [defaultValues, setDefaultValues] = useState({
        firstName: 'Stijn',
        lastName: 'Rogiest',
        todo: [
            {
                title: 'not epic',
                id: 'asdjfklasdfjklasdljkf'
            }
        ]
    })

    const form = useForm(defaultValues)

    return (
        <form
            style={{ margin: '3em' }}
            onSubmit={(ev) => {
                ev.preventDefault()
                setDefaultValues(form.values)
                console.log('submit', form.values)
            }}
        >
            <Listener
                form={form}
                name='firstName'
                render={({ value, setValue }) => (
                    <input
                        value={value}
                        onChange={(ev) => setValue(ev.target.value)}
                    />
                )}
            />
            <ArrayField
                name='todo'
                parent={form}
                render={({ values, append, remove, form }) => (
                    <>
                        <ul>
                            {values.map((_, i) => (
                                <ChildForm
                                    key={i}
                                    parent={form}
                                    name={i}
                                    render={(form) => (
                                        <li>
                                            <FormVisualize form={form} />

                                            <Listener
                                                form={form}
                                                name='title'
                                                render={({
                                                    value,
                                                    setValue,
                                                    dirty
                                                }) => (
                                                    <input
                                                        style={{
                                                            background: dirty
                                                                ? '#f99'
                                                                : '#fff'
                                                        }}
                                                        value={value}
                                                        onChange={(ev) =>
                                                            setValue(
                                                                ev.target.value
                                                            )
                                                        }
                                                    />
                                                )}
                                            />
                                            <button
                                                type='button'
                                                onClick={() => remove(i)}
                                            >
                                                remove
                                            </button>
                                        </li>
                                    )}
                                />
                            ))}
                        </ul>
                        <button
                            type='button'
                            onClick={() => {
                                let input = window.prompt('Enter new todo item')
                                if (input)
                                    append({
                                        title: input,
                                        id: '' + new Date().getTime()
                                    })
                            }}
                        >
                            Add todo item
                        </button>
                    </>
                )}
            />

            <FormVisualize form={form} />

            <button>submit</button>
            <button type='button' onClick={() => form.reset()}>
                reset
            </button>
        </form>
    )
}
