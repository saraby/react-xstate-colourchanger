import { MachineConfig, Action, assign , actions} from "xstate";

const { send, cancel } = actions;


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
    "on Monday": { day: "Monday" },
    "on Tuesday": { day: "Tuesday" },
    "on Wednesday": { day: "Wednesday" },
    "on Thursday": { day: "Thursday" },
    "on Friday": { day: "Friday" },

    // Time:
    "at 6": { time: "6 am" },
    "at 7": { time: "7 am" },
    "at 8": { time: "8 am" },
    "at 9": { time: "9 am" },
    "at 10": { time: "10 am" },
    "at 11": { time: "11 am" },
    "at 12": { time: "12 pm" },
}

const yes_no_grammar: { [index: string]: { yes_no?: boolean } } = {
    // Approve:
    "yes": { yes_no: true },
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
function maxTimeouts () : any {
    return {actions: assign((context:SDSContext) => { return { counts: context.counts ? context.counts + 1 : 1 } }),
        cond: (context:SDSContext) => context.counts == null || context.counts < 3 }}
function zeroTimeouts () : any {
    return {actions: assign((context: SDSContext) => { return { counts: 0 } }),
        cond: (context: SDSContext) => context.counts >= 3 }}

function machineStates(prompt: Action<SDSContext, SDSEvent>, nomatch: string, timeoutReprompt: Action<SDSContext, SDSEvent> ): MachineConfig<SDSContext, any, SDSEvent> {
    return ({
        initial: 'prompt',
        states: {
            prompt: {
                entry: prompt,
                on: { ENDSPEECH: 'ask' }
            },
            ask: {
                entry: [send('LISTEN'), send('MAXSPEECH', {delay: 5000, id: "countdown"})]
            },

            nomatch: {
                entry: say(nomatch),
                on: { ENDSPEECH: "ask" }
            },

            timeoutReprompt: {
                entry: timeoutReprompt,
                on: { ENDSPEECH: "ask" }
            },

            finalReprompt: {
                entry: say("You do not seem to be here, I guess we'll talk later then, see you!"),
                on: { ENDSPEECH: "#appointment.start.init", }

            }
        }

    })
}

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({ 
    initial: 'start',
    id: "appointment",
    states: {
        start:{
            initial: "init",
            states:{
                hist: { type: 'history'},
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
                    on: {
                        RECOGNISED: [
                            { target: '#appointment.help', cond: ((context) => context.recResult === 'help' ) },
                            {cond: (context) => "person" in (grammar[context.recResult] || {}),
                            actions: assign((context) => {return {person: grammar[context.recResult].person}}),
                            target: "day"},
                            { target: ".nomatch"}],
                        
                        MAXSPEECH:[{...maxTimeouts(), target: ".timeoutReprompt"},  
                                {...zeroTimeouts(), target: ".finalReprompt"}]

                    },  
                    ...machineStates(say("Who are you meeting with?"),
                    "Sorry I don't know them! Please choose who you're meeting with.",
                    say("You haven't responded yet! Would you please tell us, who you're meeting with?"))
                },
                day: {
                    on: {
                        RECOGNISED: [
                            { target: '#appointment.help', cond: (context) => context.recResult === 'help' },
                            {cond: (context) => "day" in (grammar[context.recResult] || {}),
                            actions: assign((context) => { return { day: grammar[context.recResult].day } }),
                            target: "whole_day"},
                            { target: ".nomatch" }],

                        MAXSPEECH: [{ ...maxTimeouts(), target: ".timeoutReprompt" },
                        { ...zeroTimeouts(), target: ".finalReprompt" }]
                    },

                    ...machineStates(send((context) => ({
                        type: "SPEAK",
                        value: `OK. ${context.person}. On which day is your meeting?`})),
                        "If you seek an appointment during the weekend, that's not possible. Please choose another day",
                        send((context) => ({
                            type: "SPEAK",
                            value: `You haven't responded yet! Now, please choose on which day you want to meet ${context.person}.`
                        })))

                   

                },
                whole_day: {
                    on: {
                        RECOGNISED: [
                            { target: '#appointment.help', cond: (context) => context.recResult === 'help' },
                            {
                                cond: (context) => yes_no_grammar[context.recResult] ? yes_no_grammar[context.recResult].yes_no === true : false,
                                target: "confirm_whole_day"
                            },
                            {
                                cond: (context) => yes_no_grammar[context.recResult] ? yes_no_grammar[context.recResult].yes_no === false : false,
                                target: "time"
                            },
                            { target: ".nomatch" }],

                        MAXSPEECH: [{ ...maxTimeouts(), target: ".timeoutReprompt" },
                        { ...zeroTimeouts(), target: ".finalReprompt" }]
                    },
                    ...machineStates(say("Will it take the whole day?"),
                        "Sorry I don't understand what you said, Can you repeat?",
                        say("You haven't responded yet! Would you please confirm if your meeting is going to last for the whole day?") )
                },

                confirm_whole_day: {
                    initial: "prompt",
                    on: {
                        RECOGNISED: [
                            { target: '#appointment.help', cond: (context) => context.recResult === 'help' },
                            {
                                cond: (context) => yes_no_grammar[context.recResult] ? yes_no_grammar[context.recResult].yes_no === true : false,
                                target: "confirm_appointment"
                            },
                            {
                                cond: (context) => yes_no_grammar[context.recResult] ? yes_no_grammar[context.recResult].yes_no === false : false,
                                target: "who"
                            },
                            { target: ".nomatch" }],

                        MAXSPEECH: [{ ...maxTimeouts(), target: ".timeoutReprompt" },
                        { ...zeroTimeouts(), target: ".finalReprompt" }]
                    },
                    ...machineStates(send((context) => ({
                        type: "SPEAK",
                        value: `Do you want me to create an appointment with ${context.person} 
                                            on ${context.day} for the whole day?`})),
                        "Sorry I don't understand what you said, Can you repeat?", send((context) => ({
                            type: "SPEAK",
                            value: `"You haven't responded yet! Would you please confirm your appointment details?
                            I will create an appointment with ${context.person} on ${context.day} for the whole day, does that work for you?`
                        }))),
                },

                time: {
                    initial: "prompt",
                    on: {
                        RECOGNISED: [
                            { target: '#appointment.help', cond: (context) => context.recResult === 'help' },
                            {cond: (context) => "time" in (grammar[context.recResult] || {}),
                            actions: assign((context) => { return { time: grammar[context.recResult].time } }),
                            target: "confirm_time_appointment"},
                            { target: ".nomatch" }],
                        
                        MAXSPEECH: [{ ...maxTimeouts(), target: ".timeoutReprompt" },
                        { ...zeroTimeouts(), target: ".finalReprompt" }]
                    },
                    ...machineStates(say("What time is your meeting?"), 
                    "Sorry the time you chose is not available. Please choose a different time!",
                        say("What time is your meeting?"))

                   
                },

                confirm_time_appointment: {
                    initial: "prompt",
                    on: {
                        RECOGNISED: [
                            { target: '#appointment.help', cond: (context) => context.recResult === 'help' },
                            {
                                cond: (context) => yes_no_grammar[context.recResult] ? yes_no_grammar[context.recResult].yes_no === true : false,
                                target: "confirm_appointment"
                            },
                            {
                                cond: (context) => yes_no_grammar[context.recResult] ? yes_no_grammar[context.recResult].yes_no === false : false,
                                target: "who"
                            },
                            { target: ".nomatch" }],
                        
                        MAXSPEECH: [{ ...maxTimeouts(), target: ".timeoutReprompt" },
                        { ...zeroTimeouts(), target: ".finalReprompt" }]

                    },

                    ...machineStates(send((context) => ({
                        type: "SPEAK",
                        value: `Do you want me to create an appointment with ${context.person} 
                                            on ${context.day} at ${context.time}?`})),
                        "Sorry I don't understand what you said, Can you repeat?", send((context) => ({
                            type: "SPEAK",
                            value: `"You haven't responded yet! Would you please confirm your appointment details?
                            I will create an appointment with ${context.person} on ${context.day} at ${context.time}, does that work for you?`
                        }))),
                  
                },
                confirm_appointment: {
                    entry: say('Your appointment has been created! See you!'),
                    on: { ENDSPEECH: "#appointment.start.init" }
                }
            }
        },
        help: {
            entry: say("Don't panic, we can go one step back!"),
            on: { ENDSPEECH: "start.hist" }
        }
    }


})