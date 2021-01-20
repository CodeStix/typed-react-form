import React, { useState } from 'react'
import {
    AnyListener,
    ArrayField,
    ChildForm,
    FormState,
    Listener,
    useForm
} from './StateForm'
import { VisualRender } from './VisualRender'

function FormVisualize<T>(props: { form: FormState<T> }) {
    return (
        <AnyListener
            form={props.form}
            render={({ values }) => (
                <VisualRender>
                    <div style={{ background: '#eee' }}>
                        <pre>{JSON.stringify(values, null, 2)}</pre>
                        {props.form.isDirty && (
                            <p>
                                <strong>DIRTY</strong>
                            </p>
                        )}
                    </div>
                </VisualRender>
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
        <VisualRender>
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
                        <VisualRender>
                            <ul>
                                {values.map((_, i) => (
                                    <ChildForm
                                        key={i}
                                        parent={form}
                                        name={i}
                                        render={(form) => (
                                            <li>
                                                <Listener
                                                    form={form}
                                                    name='title'
                                                    render={({
                                                        value,
                                                        setValue
                                                    }) => (
                                                        <VisualRender>
                                                            <input
                                                                value={value}
                                                                onChange={(
                                                                    ev
                                                                ) =>
                                                                    setValue(
                                                                        ev
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </VisualRender>
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
                                    let input = window.prompt(
                                        'Enter new todo item'
                                    )
                                    if (input)
                                        append({
                                            title: input,
                                            id: '' + new Date().getTime()
                                        })
                                }}
                            >
                                Add todo item
                            </button>
                        </VisualRender>
                    )}
                />

                <FormVisualize form={form} />

                <button>submit</button>
                <button type='button' onClick={() => form.reset()}>
                    reset
                </button>
            </form>
        </VisualRender>
    )
}
