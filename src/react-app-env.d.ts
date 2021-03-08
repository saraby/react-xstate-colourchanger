/// <reference types="react-scripts" />

declare module 'react-speech-kit';

interface SDSContext {
    recResult: string;
    person: string;
    time: string;
    day: string;
    nluData: any;
    ttsAgenda: string;
    yes_no: boolean,
    query: string;
    output: string;
    snippet: string;
    action: string;
    object: string;
    counts: number

}

type SDSEvent =
    | { type: 'CLICK' }
    | { type: 'RECOGNISED' }
    | { type: 'ASRRESULT', value: string }
    | { type: 'ENDSPEECH' }
    | { type: 'LISTEN' }
    | { type: 'MAXSPEECH' }
    | { type: 'SPEAK', value: string };
