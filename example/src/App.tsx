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

function FormVisualize<T, TError, TState extends object>(props: {
    form: FormState<T, TError, TState>
}) {
    return (
        <AnyListener
            form={props.form}
            render={({ values, errors }) => (
                <VisualRender>
                    <div style={{ background: '#eee' }}>
                        <pre>{JSON.stringify(values, null, 2)}</pre>
                        {props.form.isDirty && (
                            <p>
                                <strong>DIRTY</strong>
                            </p>
                        )}
                        <pre>{JSON.stringify(errors, null, 2)}</pre>
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
                title: '',
                id: 'asdjfklasdfjklasdljkf'
            }
        ]
    })

    const form = useForm(
        defaultValues,
        { isSubmitting: false },
        (values) =>
            values.todo
                .filter((e) => e.title.length < 5)
                .reduce((prev, _val, index) => {
                    let l = prev['todo']
                    if (!l) {
                        l = {}
                        prev['todo'] = l
                    }
                    l[index] = { title: 'title must be longer' }
                    return prev
                }, {}),
        true
    )

    form.validateOnChange = false

    return (
        <VisualRender>
            <form
                style={{ margin: '3em' }}
                onSubmit={async (ev) => {
                    ev.preventDefault()
                    form.validate()
                    if (form.anyError) return
                    console.log('submit', form.values)
                    form.setState({ isSubmitting: true })
                    await new Promise((res) => setTimeout(res, 1000))
                    form.setState({ isSubmitting: false })
                    setDefaultValues(form.values)
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
                                        validator={(values) => ({
                                            title:
                                                values.title.length < 5
                                                    ? 'pick a longer title'
                                                    : undefined
                                        })}
                                        render={(form) => (
                                            <li>
                                                <FormVisualize form={form} />
                                                <Listener
                                                    form={form}
                                                    name='title'
                                                    render={({
                                                        value,
                                                        setValue,
                                                        error
                                                    }) => (
                                                        <VisualRender>
                                                            {error && (
                                                                <p>
                                                                    <i>
                                                                        {error}
                                                                    </i>
                                                                </p>
                                                            )}
                                                            <input
                                                                disabled={
                                                                    form.state
                                                                        .isSubmitting
                                                                }
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
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        form.setState({
                                                            isSubmitting: !form
                                                                .state
                                                                .isSubmitting
                                                        })
                                                    }
                                                >
                                                    notify
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

                <AnyListener
                    form={form}
                    render={({ state: { isSubmitting } }) => (
                        <>
                            <button disabled={isSubmitting}>submit</button>
                            <button
                                disabled={isSubmitting}
                                type='button'
                                onClick={() => form.reset()}
                            >
                                reset
                            </button>
                        </>
                    )}
                />
            </form>
        </VisualRender>
    )
}
