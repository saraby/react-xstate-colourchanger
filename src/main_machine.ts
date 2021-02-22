import { MachineConfig, send, assign, Action } from "xstate";
import { dmMachine, say, listen } from "./dmAppointment"

function promptAndAsk(prompt: string): MachineConfig<SDSContext, any, SDSEvent> {
    return ({
        initial: 'prompt',
        states: {
            prompt: {
                entry: say(prompt),
                on: { ENDSPEECH: 'ask' }
            },
            ask: {
                entry: send('LISTEN'),
            },
        }
    })
}

const proxyurl = "https://cors-anywhere.herokuapp.com/";
const rasaurl = 'https://create-appointment.herokuapp.com/model/parse'
const nluRequest = (text: string) =>
    fetch(new Request(proxyurl + rasaurl, {
        method: 'POST',
        headers: { 'Origin': 'http://maraev.me' }, // only required with proxy
        body: `{"text": "${text}"}`
    }))
        .then(data => data.json());

export const dmMainMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'init',
    states: {
        init: {
            on: {
                CLICK: 'welcome'
            }
        },
        welcome: {
            on: {
                RECOGNISED: {
                    target: 'invocation',
                    actions: assign((context) => { return { query: context.recResult } }),
                }
            },
            ...promptAndAsk("What do you want to do?")
        },
        invocation: {
            invoke: {
                id: 'machine',
                src: (context, event) => nluRequest(context.query),
                onDone: {
                    target: 'go_to',
                    actions: [assign((context, event) => { return { output: event.data.intent.name } }),
                    (context: SDSContext, event: any) => console.log(event.data)]
                },
                onError: {
                    target: 'welcome',
                    actions: (context, event) => console.log(event.data)
                }
            }
        },

        go_to: {
            entry: send("RECOGNISED"),
            on: {
                RECOGNISED: [
                    { target: 'appointment_machine', cond: (context) => context.output === "appointment" },
                    { target: 'todo', cond: (context) => context.output === "to_do" },
                    { target: 'set_timer', cond: (context) => context.output === "timer" }]
            }
        },

        appointment_machine: {
            ...dmMachine
        },

        todo: {
            initial:"prompt",
            states:{
                prompt: {
                    ...promptAndAsk("I'll add a new item to your to_do list")
                } 
            }
        },

        set_timer: {
            initial: "prompt",
            states: {
                prompt: {
                    ...promptAndAsk("I will set a new timer?")
                }
            }
        }
        
    }
})