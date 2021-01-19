import React from 'react'
import { AnyListener, ArrayField, Listener, useForm } from './StateForm'

export default function App() {
    let defaultValues = {
        firstName: 'Stijn',
        lastName: 'Rogiest',
        todo: [
            {
                title: 'not epic'
            }
        ]
    }

    const form = useForm(defaultValues)

    return (
        <form style={{ margin: '3em' }}>
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
                render={({ values, append, remove }) => (
                    <>
                        <ul>
                            {values.map((e, i) => (
                                <li>
                                    {e.title}{' '}
                                    <button
                                        type='button'
                                        onClick={() => remove(i)}
                                    >
                                        remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button
                            type='button'
                            onClick={() => {
                                let input = window.prompt('Enter new todo item')
                                if (input) append({ title: input })
                            }}
                        >
                            Add todo item
                        </button>
                    </>
                )}
            />

            <AnyListener
                form={form}
                render={({ values }) => (
                    <pre>{JSON.stringify(values, null, 2)}</pre>
                )}
            />
        </form>
    )
}
