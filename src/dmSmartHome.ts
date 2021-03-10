import { MachineConfig, send, Action, assign} from "xstate";

// SRGS parser and example (logs the results to console on page load)
import { loadGrammar } from './runparser'
import { parse } from './chartparser'
import { grammar } from './grammars/smartHomeGrammar'

// const gram = loadGrammar(grammar)
// var input = "turn off the light"
// const prs = parse(input.split(/\s+/), gram)
// const result = prs.resultsForRule(gram.$root)[0]
// console.log(result)


export const parsing = (input: any) => {
    const gram = loadGrammar(grammar)
    const prs = parse(input.split(/\s+/), gram)
    const result = prs.resultsForRule(gram.$root)[0]
    const out = [result.command.action, result.command.object]
    // const out = `perform action ${result.command.action} on the specified object ${result.command.object}`;
    return out
}


export function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}

function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

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
            new_task: {
                entry: say("Great! What do you want me to do?"),
                on: { ENDSPEECH: 'ask' }
            }
        }
    })
}


const yes_no_grammar: { [index: string]: { yes_no?: boolean } } = {
    // Approve:
    "yes": { yes_no: true },
    "yes, please": { yes_no: true },
    "yep": { yes_no: true },
    "I do": { yes_no: true },

    // Disapprove:
    "no": { yes_no: false },
    "no, I don't": { yes_no: false },
    "nope": { yes_no: false },
    "hell not": { yes_no: false },

}
const commands = ["turn off the light",
'turn on the light',
'turn off the air conditioning',
'turn on the air conditioning',
'turn off the AC',
'turn on the AC',
'turn on the heat',
'turn off the heat',
'open the window',
'close the door',
'open the door',
'close the window']

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'init',
    states: {
        init: {
            on: {
                CLICK: 'welcome'
            }
        },
        welcome: {
            on: {
                RECOGNISED: [{ cond: (context) => commands.includes(context.recResult),
                    actions: [assign((context) => { return { action: parsing(context.recResult)[0] } }), assign((context) => { return { object: parsing(context.recResult)[1] } })],
                    target: "analyse"}, 
                    { target: "#root.dm.extra_tasks.nomatch" }
                    ]

                 
            },
            ...promptAndAsk("Hello, Welcome to your new smart home system. How can I help you?")
            
        },

        analyse: {
            initial: "prompt",
           
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `Ok, processing your request to perform action ${context.action} on the object ${context.object}.`
                    })),
                    on: { ENDSPEECH: '#root.dm.extra_tasks' }
                },
            }
        },   

        extra_tasks: {
            initial: "prompt",
            on: {
                RECOGNISED: [
                    {cond: (context) => yes_no_grammar[context.recResult] ? yes_no_grammar[context.recResult].yes_no === true : false,
                        target: "welcome.new_task"},
                    {cond: (context) => yes_no_grammar[context.recResult] ? yes_no_grammar[context.recResult].yes_no === false : false,
                        target: "final"},
                    { target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: say("Do you want anything else?"),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I don't understand what you said, Can you repeat?"),
                    on: { ENDSPEECH: "#root.dm.welcome.ask" }
                }
            }
        },

        final: {
            initial: 'finish',
            states: {
                finish: {
                    entry: say('Thank you, see you later!'),
                }
            }
        }

    }
})
