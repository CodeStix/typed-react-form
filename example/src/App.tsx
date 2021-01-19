import React from 'react'
import { AnyListener, Listener, useForm } from './StateForm'

export default function App() {
    let defaultValues = {
        firstName: 'Stijn',
        lastName: 'Rogiest'
    }

    const form = useForm(defaultValues)

    return (
        <form>
            <AnyListener
                form={form}
                render={({ values }) => (
                    <pre>{JSON.stringify(values, null, 2)}</pre>
                )}
            />
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
        </form>
    )
}
