import { MachineConfig, send, Action, assign } from "xstate";



export function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

export function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}

const grammar: { [index: string]: { person?: string, day?: string, time?: string } } = {
    // Person:
    "John": { person: "John Appleseed" },
    "Jamal": { person: "Jamal Youssef" },
    "Jennifer": { person: "Jennifer Lawrence" },
    "Sophia": { person: "Sophia Bush" },
    "Morgan": { person: "Morgan Freeman" },
    "Tom": { person: "Tom Hanks" },

    // Day:
    "on Monday" : { day: "Monday" },
    "on Tuesday": { day: "Tuesday" },
    "on Wednesday": { day: "Wednesday" },
    "on Thursday": { day: "Thursday" },
    "on Friday": { day: "Friday" },
    
    // Time:
    "at 6": { time: "6 am" },
    "at 7": { time: "7 am" },
    "at 8": { time: "8 am" },
    "at 9": { time: "9 am" },
    "at 10": { time: "10 am"},
    "at 11": { time: "11 am"},
    "at 12": { time: "12 pm"},
}

const yes_no_grammar: { [index: string]: { yes_no?: boolean } } = {
    // Approve:
    "yes": { yes_no : true },
    "yes, please": { yes_no: true },
    "of course": { yes_no: true },
    "no doubt": { yes_no: true },
    "absolutely": { yes_no: true },
    "yep": { yes_no: true },
    "I do": { yes_no: true },
    "go ahead": { yes_no: true },

    // Disapprove:
    "no": { yes_no: false },
    "no, I don't": { yes_no: false },
    "no way": { yes_no: false },
    "of course not": { yes_no: false },
    "nope": { yes_no: false },
    "hell not": { yes_no: false },
    "not sure": { yes_no: false },

}



export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'welcome',
    states: {
        init: {
            on: {
                CLICK: 'welcome'
            }
        },
        welcome: {
            initial: "prompt",
            on: { ENDSPEECH: "who" },
            states: {
                prompt: { entry: say("Let's create an appointment") }
            }
        },

        who: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => "person" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { person: grammar[context.recResult].person } }),
                    target: "day"

                },
                { target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: say("Who are you meeting with?"),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I don't know them! Please choose who you're meeting with."),
                    on: { ENDSPEECH: "ask" }
                }
            }
        },
        day: {
            
            initial: "prompt",
            on: { 
                RECOGNISED: [{
                    cond: (context) => "day" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { day: grammar[context.recResult].day } }),
                    target: "whole_day"
                },
                    { target: ".nomatch" }],
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `OK. ${context.person}. On which day is your meeting?`
                    })),
                    on: { ENDSPEECH:"ask" } 
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("If you seek an appointment during the weekend, that's not possible. Please choose another day"),
                    on: { ENDSPEECH: "ask" }
                }
            },
        
        },
        whole_day: {
            initial: "prompt",
            on: { 
                RECOGNISED: [
                    {cond: (context) => yes_no_grammar[context.recResult] ? yes_no_grammar[context.recResult].yes_no === true : false,
                        target: "confirm_whole_day"},
                    {cond: (context) => yes_no_grammar[context.recResult] ? yes_no_grammar[context.recResult].yes_no === false : false,
                        target: "time"},
                    {   target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `Will it take the whole day?`
                    })),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I don't understand what you said, Can you repeat?"),
                    on: { ENDSPEECH: "ask" }
                }
            }
        },
        
        confirm_whole_day: {
            initial: "prompt",
            on: {
                RECOGNISED: [
                    {cond: (context) => yes_no_grammar[context.recResult] ? yes_no_grammar[context.recResult].yes_no === true : false,
                        target: "confirm_appointment"},
                    {cond: (context) => yes_no_grammar[context.recResult] ? yes_no_grammar[context.recResult].yes_no === false : false,
                        target: "who"},
                    {   target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `Do you want me to create an appointment with ${context.person} 
                                    on ${context.day} for the whole day?`
                    })),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I don't understand what you said, Can you repeat?"),
                    on: { ENDSPEECH: "ask" }
                }
            }
        },

        time: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => "time" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { time: grammar[context.recResult].time } }),
                    target: "confirm_time_appointment"
                },
                { target: ".nomatch" }],
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `What time is your meeting?`
                    })),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry the time you chose is not available. Please choose a different time!"),
                    on: { ENDSPEECH: "ask" }
                }
            }
        },
        confirm_time_appointment: {
            initial: "prompt",
            on: {
                RECOGNISED: [
                    {cond: (context) => yes_no_grammar[context.recResult] ? yes_no_grammar[context.recResult].yes_no === true : false,
                        target: "confirm_appointment"},
                    {cond: (context) => yes_no_grammar[context.recResult] ? yes_no_grammar[context.recResult].yes_no === false : false,
                        target: "who"},
                    {   target: ".nomatch" }]

            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `Do you want me to create an appointment with ${context.person} 
                                    on ${context.day} at ${context.time}?`
                    })),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I don't understand what you said, Can you repeat?"),
                    on: { ENDSPEECH: "ask" }
                }
            }
        },
        confirm_appointment: {
            initial: 'confirm',
            states: {
                confirm: {
                    entry: say('Your appointment has been created'),
                }
            }
        }
    }


})
