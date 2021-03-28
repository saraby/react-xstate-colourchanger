import { MachineConfig, Action, assign, actions, State, StateNode } from "xstate";
import { mapContext } from "xstate/lib/utils";
const { send, cancel } = actions;


// import { say, listen } from "./index";

let callback: any

export function registerUICallback(func: any) {
    callback = func
}

export function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}

function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}


const grammar: { [index: string]: { help?: string } } = {
    "help": { help: "help" },
    "help me": { help: "help" },
    "I need help": { help: "help" },
}

const proxyurl = "https://cors-anywhere.herokuapp.com/";
const rasaurl = 'https://scrambled-letters.herokuapp.com/model/parse'
const nluRequest = (text: string) =>
    fetch(new Request(proxyurl + rasaurl, {
        method: 'POST',
        headers: { 'Origin': 'http://maraev.me' }, // only required with proxy
        body: `{"text": "${text}"}`
    }))
        .then(data => data.json());



const awesome = ["awesome", "meow", "some", "same", "seem", "saw", "sew", "wee", "me", "we", "as", "see"]
const dancer = ["dancer","dance","race","care","car","dare","ran","dace", "and", "earn", "ear", "near", "red"]
const dialogue = ["dialogue", "goal", "dial", "log", "go", "guide", "dog", "do", "glue", "dig", "glad", "leg", "gold"]
const permission = ["permission", "person", "miss", "son", "per", "mission", "rise", "piss", "pen", "pin", "Rome", "mess", "pine", "norm"]
const technology = ["technology", "log", "tech", "echo", "ten", "only", "get", "net", "let", "hot", "tone", "gone", "note", "not"]
const gothenburg = ["gothenburg", "bug", "rug", "got", "then", "the", "burn", "be", "ten", "thorn", "throne", "robe", "tube", "run", "gun", "gone", "horn"] 
const adventure = ["adventure", "venue", "turn", "red", "vat", "rat", "rate", "nature", "true", "rent", "rented", "rated", "advert", "near", "vertu"]
const intelligence = ["intelligence", "cite", "tell", "till", "legit", "gene", "get", "ill", "let", "intel", "line", "cell", "telling", "lit", "nit", "lite", "lie"]

function repromptState(): any {
    return {

        cond: (context: SDSContext) => context.list.includes(context.recResult) && (context.words.length < 4) 
            && (!(context.words.includes(context.recResult))) && (context.list[0] != (context.recResult)),
        actions: (context: SDSContext) => { context.words.push(context.recResult)  }
    }
}

function allLetters(): any {
    return {
        cond: (context: SDSContext) => context.list[0] === (context.recResult) && (context.words.length < 4)
            && (!(context.words.includes(context.recResult))),
            actions: (context: SDSContext) => { { context.words.push(context.recResult) } }
    }
}

function noMatch(): any {
    return {
        cond:(context: SDSContext) => !(context.list.includes(context.recResult)) || (context.words.includes(context.recResult))
    }
}

function allFinal(): any {
    return {
        cond: (context: SDSContext) => context.list[0] === (context.recResult) && (context.words.length === 4),
            actions: (context: SDSContext) => { context.words.push(context.recResult) 
        }
    }
}

function toTheNextState(): any {
    return {
        cond: (context: SDSContext) => context.words.length === 4 && (context.list[0] != (context.recResult)),
        actions: (context: SDSContext) => {  context.words.push(context.recResult)}
    }
}

function recognised_event(): any {
    return [
        { target: '#word_guess.help', cond: (context:SDSContext) => "help" in (grammar[context.recResult] || {})},
        { target: '.jump', cond: ((context: SDSContext) => context.recResult === 'jump') },
        { cond: (context: SDSContext) => callback({ words: context.words }) },
        { ...noMatch(), target: ".nomatch" },
        { ...allLetters(), target: ".all_letters"},
        { ...allFinal(), target: ".all_final"},
        { ...repromptState(), target: ".reprompt" },
        { ...toTheNextState(), target: ".finalReprompt" },
    ]
}


function machineStates(target: string): MachineConfig<SDSContext, any, SDSEvent> {
    return ({
        initial: 'prompt',
        states: {
            prompt: {
                entry: [say("You have these letters in front of you, try to form 5 words of them."), (context) => callback({ letters: context.list[0].split('').sort(function () { return 0.5 - Math.random() }).join('') })],
                on: { ENDSPEECH: 'ask' }
            },
            ask: {
                entry: [send('LISTEN'), send('MAXSPEECH', { delay: 10000, id: "countdown" })]
            },

            nomatch: {
                entry: say("No, that's wrong, try again"),
                on: { ENDSPEECH: "ask" }
            },

            reprompt: {
                entry: send((context) => ({
                    type: "SPEAK",
                    value: `ALrighty you have guessed this word ${context.recResult}, try another.`
                })),
                on: { ENDSPEECH: "ask" },
                exit: assign({ temp: context => context.words })
            },

            finalReprompt: {
                entry: send((context) => ({
                    type: "SPEAK",
                    value: `Bravooo, Amazing!!! you have guessed these words ${context.words}, Now, let's go to the next level!"`
                })),
                on: { ENDSPEECH: target },
                exit: [assign({ temp: context => context.words }), assign({ words: context => [] }), assign({ list: context => [] })]
            },
            jump: {
                entry: say("Ok! You want to jump to next level."),
                on: {
                    ENDSPEECH: [
                        { target: target, 
                        actions: assign((context) => { return { counts: context.counts ? context.counts + 1 : 1 } }),
                        cond: (context) => context.counts == null || context.counts < 3},
                        {target: "#word_guess.gameOver",
                            actions: assign((context) => { return { counts: 0 } }),
                            cond: (context) => context.counts === 3}]
                },
                exit: [assign({ words: context => [] }), assign({ list: context => [] })]
            },
            all_letters:{
                entry: ['magicWord',send((context) => ({
                    type: "SPEAK",
                    value: `OH My GOD! What a great job! You have found the magic word ${context.recResult}. Now try another`
                }))],
                on: { ENDSPEECH: "ask" },
                exit: assign({ temp: context => context.words })
            },

            all_final: {
                entry: [ 'magicWord', send((context: SDSContext) => ({
                    type: "SPEAK",
                    value: `Oh wow, that's amazing you found the magic word ${context.recResult}! just before we move to the next state !"`
                }))],
                on: { ENDSPEECH: target },
                exit: [assign({ words: context => [] }), assign({ list: context => [] })]
            },

            wake_up: {
                entry: say("Hello, are you here? I need you to focus but be quick!"),
                on: { ENDSPEECH: "ask" }
            }
        }
    })
}


export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'start',
    id: "word_guess",
    states: {
        start: {
            entry: assign({ words: context => [] }),
            initial: "init",
            states: {
                hist: { type: 'history' },
                init: {
                    on: {
                        CLICK: 'welcome'
                    }
                },
                welcome: {
                    initial: "prompt",
                    on: { ENDSPEECH: { target: "awesome", actions: assign({ words: context => [] }) } },
                    states: {
                        prompt: {
                            entry: say("Let's play a game, let's form 5 words of the scrambled letters. You can say jump to move to the next level but not more than 4 times or else you lose") }
                    }
                },
                awesome: {
                    entry: assign({ list: context => awesome }),
                    on: {
                        RECOGNISED: [...recognised_event()],
                        MAXSPEECH: { target: ".wake_up" }
                    },
                    ...machineStates("#word_guess.start.dancer")
                },

                dancer: {
                    entry: ['stopMagic',assign({ list: context => dancer })],
                    on: {
                        RECOGNISED: [...recognised_event()],
                        MAXSPEECH: { target: ".wake_up" }
                    },
                    ...machineStates("#word_guess.start.dialogue")
                },

                dialogue: {
                    entry: ['stopMagic',assign({ list: context => dialogue })],
                    on: {
                        RECOGNISED: [...recognised_event()],
                        MAXSPEECH: { target: ".wake_up" }

                    },
                    ...machineStates("#word_guess.start.permission"),
                },

                permission: {
                    entry: ['stopMagic',assign({ list: context => permission })],
                    on: {
                        RECOGNISED: [...recognised_event()],
                        MAXSPEECH: { target: ".wake_up" }

                    },
                    ...machineStates("#word_guess.start.technology")
                },

                technology: {
                    entry: ['stopMagic',assign({ list: context => technology })],
                    on: {
                        RECOGNISED: [...recognised_event()],
                        MAXSPEECH: { target: ".wake_up" }

                    },
                    ...machineStates("#word_guess.start.gothenburg")
                },
                gothenburg: {
                    entry: ['stopMagic',assign({ list: context => gothenburg })],
                    on: {
                        RECOGNISED: [...recognised_event()],
                        MAXSPEECH: { target: ".wake_up" }

                    },
                    ...machineStates("#word_guess.start.adventure")
                },
                adventure: {
                    entry: ['stopMagic',assign({ list: context => adventure })],
                    on: {
                        RECOGNISED: [...recognised_event()],
                        MAXSPEECH: { target: ".wake_up" }
                    },
                    ...machineStates("#word_guess.start.intelligence")
                },
                intelligence: {
                    entry: ['stopMagic',assign({ list: context => intelligence })],
                    on: {
                        RECOGNISED: [...recognised_event()],
                        MAXSPEECH: { target: ".wake_up" }
                    },
                    ...machineStates("#word_guess.start.init")
                },
            }
        },

        invocation: {
            invoke: {
                id: 'machine',
                src: (context, event) => nluRequest(context.query),
                onDone: {
                    target: 'go_to',
                    actions: [assign((context, event) => { return { output: event.data.intent.name } }),
                    (context, event: any) => console.log(event.data)]
                },
                onError: {
                    target: '#word_guess.start.init',
                    actions: (context, event) => console.log(event.data)
                }
            }
        },

        gameOver: {
            on: {
                RECOGNISED: {
                    target: '#word_guess.invocation',
                actions: assign((context) => { return { query: context.recResult } })},
                
                ENDSPEECH: ".ask" },
            initial: 'prompt',
            states: {
                prompt: {
                    entry: say("I'm sorry! you have lost, this is the fourth time for you to jump to the next level. You can try again later, What do you want to do now? play again, study or eat?") ,
                    on: { ENDSPEECH: 'ask' }
                },
                ask: {
                    entry: send('LISTEN'),
                },
            },
            exit: assign((context) => { return { counts: 0 } })
        },

        gameWin: {
            on: {
                RECOGNISED: {
                    target: '#word_guess.invocation',
                    actions: assign((context) => { return { query: context.recResult } })
                },

                ENDSPEECH: ".ask"
            },
            initial: 'prompt',
            states: {
                prompt: {
                    entry: say("What a game!! you rocked it! now tell me what you wanna do next after winning that game. Do you want to play again or study or go eat something?"),
                    on: { ENDSPEECH: 'ask' }
                },
                ask: {
                    entry: send('LISTEN'),
                },
            },
            exit: assign((context) => { return { counts: 0 } })
        },

        go_to: {
            entry: send("RECOGNISED"),
            on: {
                RECOGNISED: [
                    { target: '.play', cond: (context) => context.output === "play" },
                    { target: '.study', cond: (context) => context.output === "study" },
                    { target: '.eat', cond: (context) => context.output === "eat" }]
            },
            states:{
                play:{
                    entry: say("I love your enthusiasm, let's do it again!!"),
                    on: { ENDSPEECH: "#word_guess.start.welcome"}
                },
                study: {
                    entry: say("Are you kidding me? You haven't done your homework yet? Go do it now! You're punished for a week!"),
                    on: { ENDSPEECH: "#word_guess.start.init" }
                },
                eat: {
                    entry: say("What? I can't believe you haven't eaten you poor thing!! please go and get a bite! Thank you for today, it was lovely playing with you!"),
                    on: { ENDSPEECH: "#word_guess.start.init" }
                }

            }
        },
        
        help: {
            entry: say("Don't panic, we can go one step back!"),
            on: { ENDSPEECH: "start.hist" },
            exit: assign({ words: context => [] })
        }
    }
})