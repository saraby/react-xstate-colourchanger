import "./styles.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
<<<<<<< Updated upstream
import { Machine, assign, State, actions } from "xstate";
import { useMachine, asEffect } from "@xstate/react";
import { inspect } from "@xstate/inspect";
// import { dmMachine } from "./dmSmartHome";
import { dmMachine } from "./dmAppointmentPlus";
const { send, cancel } = actions;
=======
import { Machine, assign, Action, State, actions } from "xstate";
import { useMachine, asEffect } from "@xstate/react";
import { inspect } from "@xstate/inspect";
import { dmMachine } from "./dmProject";
const { send, cancel } = actions;
import { GameUI } from './GameUI'
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';

>>>>>>> Stashed changes

inspect({
    url: "https://statecharts.io/inspect",
    iframe: false
});

type GameProps = {
    gameStage: string
}
type GameState = {
    gameStage: string
}


// export function say(text: string): Action<SDSContext, SDSEvent> {
//     return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
// }

// export function listen(): Action<SDSContext, SDSEvent> {
//     return send('LISTEN')
// }

const machine = Machine<SDSContext, any, SDSEvent>({
    id: 'root',
    type: 'parallel',
    states: {
        dm: {
            ...dmMachine
        },
        asrtts: {
            initial: 'idle',
            states: {
                idle: {
                    on: {
                        LISTEN: 'recognising',
                        SPEAK: {
                            target: 'speaking',
                            actions: assign((_context, event) => { return { ttsAgenda: event.value } })
                        }
                    }
                },
                recognising: {
                    initial: 'progress',
                    entry: 'recStart',
                    exit: 'recStop',
                    on: {
                        ASRRESULT: {
                            actions: ['recLogResult',
                                assign((_context, event) => { return { recResult: event.value } })],
                            target: '.match'
                        },
                        RECOGNISED: {
<<<<<<< Updated upstream
                            target: 'idle', actions: [cancel('countdown'), assign((context) => { return { counts: 0 } })]
                        },
                        MAXSPEECH:'idle'
=======
                            target: 'idle', actions: cancel('countdown')
                        },
                        MAXSPEECH: 'idle'
>>>>>>> Stashed changes
                    },
                    states: {
                        progress: {
                        },
                        match: {
                            entry: send('RECOGNISED'),
                        },
                    }
                },
                speaking: {
                    entry: 'ttsStart',
                    on: {
                        ENDSPEECH: 'idle',
                    }
                }
            }
        }
    },
},
    {
        actions: {
            recLogResult: (context: SDSContext) => {
                /* context.recResult = event.recResult; */
                console.log('<< ASR: ' + context.recResult);
            },
            test: () => {
                console.log('test')
            },
            logIntent: (context: SDSContext) => {
                /* context.nluData = event.data */
                console.log('<< NLU intent: ' + context.nluData.intent.name)
            }
        },
    });



interface Props extends React.HTMLAttributes<HTMLElement> {
    state: State<SDSContext, any, any, any>;
}
const ReactiveButton = (props: Props): JSX.Element => {
    switch (true) {
        case props.state.matches({ asrtts: 'recognising' }):
            return (
                <button type="button" className="glow-on-hover"
                    style={{ animation: "glowing 20s linear" }} {...props}>
                    Listening...
                </button>
            );
        case props.state.matches({ asrtts: 'speaking' }):
            return (
                <button type="button" className="glow-on-hover"
                    style={{ animation: "bordering 1s infinite" }} {...props}>
                    Speaking...
                </button>
            );
        default:
            return (
                <button type="button" className="glow-on-hover" {...props}>
                    Click to start
                </button >
            );
    }
}



function App() {
    const { speak, cancel, speaking } = useSpeechSynthesis({
        onEnd: () => {
            send('ENDSPEECH');
        },
    });
    const { listen, listening, stop } = useSpeechRecognition({
        onResult: (result: any) => {
            send({ type: "ASRRESULT", value: result });
        },
    });
    const [current, send, service] = useMachine(machine, {
        devTools: true,
        actions: {
            recStart: asEffect(() => {
                console.log('Ready to receive a command.');
                listen({
                    interimResults: false,
                    continuous: true
                });
            }),
            magicWord: asEffect(() => {
                //DOM (Document Object Model)
                var fireworks = document.getElementById('fw');
                if(fireworks!=null){
                    console.log("displaying fireworks!");
                    fireworks.style.display = "block";
                }
            }),
            stopMagic: asEffect(() => {
                //DOM (Document Object Model)
                var fireworks = document.getElementById('fw');
                if(fireworks!=null){
                    console.log("hiding fireworks!");
                    fireworks.style.display = "none";
                }
            }),
            recStop: asEffect(() => {
                console.log('Recognition stopped.');
                stop()
            }),
            changeColour: asEffect((context) => {
                console.log('Repainting...');
                document.body.style.background = context.recResult;
            }),
            ttsStart: asEffect((context, effect) => {
                console.log('Speaking...');
                console.log('<< ASR: ' + context.words)
                speak({ text: context.ttsAgenda })
            }),
            ttsCancel: asEffect((context, effect) => {
                console.log('TTS STOP...');
                cancel()
            })
            /* speak: asEffect((context) => {
         * console.log('Speaking...');
             *     speak({text: context.ttsAgenda })
             * } */
        }
    });


    return (
        <div className="App">
            <ReactiveButton state={current} onClick={() => send('CLICK')} />
           

                <div className="game-ui">
                    <GameUI></GameUI>
                </div>
                <div id="fw" className="pyro">
                <div className="before"></div>
                <div className="after"></div>
            </div>
        </div>
    )
};



/* RASA API
 *  */
const proxyurl = "https://cors-anywhere.herokuapp.com/";
const rasaurl = 'https://rasa-nlu-api-00.herokuapp.com/model/parse'
const nluRequest = (text: string) =>
    fetch(new Request(proxyurl + rasaurl, {
        method: 'POST',
        headers: { 'Origin': 'http://maraev.me' }, // only required with proxy
        body: `{"text": "${text}"}`
    }))
        .then(data => data.json());

const rootElement = document.getElementById("root");
ReactDOM.render(
    <App />,
    rootElement);
