import React from 'react'
import { registerUICallback } from './dmProject'
let uiCallback: any;

// type GameProps = {
//     init: string
// }

type GameState = {
    letters: string,
    words: string[]
}

type GameProps = {

}

export class GameUI extends React.Component<GameProps, GameState>{


    constructor(props: GameProps) {
        super(props);
        this.state = {
            letters: "",
            words: []
        }
        this.setState = this.setState.bind(this)
        registerUICallback(this.setState)
    }
    render() {
        return (
            <div className="h1">
                <div>Here are the letters<br></br></div>
                <div>{this.state.letters}</div>
                <div className="h2">Correct guesses: <ul>{this.state.words.map((word) =>
                    <li>{word}</li>
                )}</ul></div>
            </div>
            
        );
    }

}