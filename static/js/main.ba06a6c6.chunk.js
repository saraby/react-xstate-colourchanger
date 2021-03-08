(this["webpackJsonpxstate-react-typescript-template"]=this["webpackJsonpxstate-react-typescript-template"]||[]).push([[0],{29:function(t,e,o){},40:function(t,e,o){"use strict";o.r(e);var n=o(26),a=o(4),s=(o(29),o(8),o(23)),c=o(11),r=o(20),i=o(2),p=o(44),l=o(43);const u=c.a.send;c.a.cancel;function m(t){return u((e=>({type:"SPEAK",value:t})))}const y={John:{person:"John Appleseed"},Jamal:{person:"Jamal Youssef"},Jennifer:{person:"Jennifer Lawrence"},Sophia:{person:"Sophia Bush"},Morgan:{person:"Morgan Freeman"},Tom:{person:"Tom Hanks"},"on Monday":{day:"Monday"},"on Tuesday":{day:"Tuesday"},"on Wednesday":{day:"Wednesday"},"on Thursday":{day:"Thursday"},"on Friday":{day:"Friday"},"at 6":{time:"6 am"},"at 7":{time:"7 am"},"at 8":{time:"8 am"},"at 9":{time:"9 am"},"at 10":{time:"10 am"},"at 11":{time:"11 am"},"at 12":{time:"12 pm"}},d={yes:{yes_no:!0},"yes, please":{yes_no:!0},"of course":{yes_no:!0},"no doubt":{yes_no:!0},absolutely:{yes_no:!0},yep:{yes_no:!0},"I do":{yes_no:!0},"go ahead":{yes_no:!0},no:{yes_no:!1},"no, I don't":{yes_no:!1},"no way":{yes_no:!1},"of course not":{yes_no:!1},nope:{yes_no:!1},"hell not":{yes_no:!1},"not sure":{yes_no:!1}};function h(){return{actions:Object(i.b)((t=>({counts:t.counts?t.counts+1:1}))),cond:t=>null==t.counts||t.counts<3}}function g(){return{actions:Object(i.b)((t=>({counts:0}))),cond:t=>t.counts>=3}}function b(t,e,o){return{initial:"prompt",states:{prompt:{entry:t,on:{ENDSPEECH:"ask"}},ask:{entry:[u("LISTEN"),u("MAXSPEECH",{delay:5e3,id:"countdown"})]},nomatch:{entry:m(e),on:{ENDSPEECH:"ask"}},timeoutReprompt:{entry:o,on:{ENDSPEECH:"ask"}},finalReprompt:{entry:m("You do not seem to be here, I guess we'll talk later then, see you!"),on:{ENDSPEECH:"#appointment.start.init"}}}}}const E={initial:"start",id:"appointment",states:{start:{initial:"init",states:{hist:{type:"history"},init:{on:{CLICK:"welcome"}},welcome:{initial:"prompt",on:{ENDSPEECH:"who"},states:{prompt:{entry:m("Let's create an appointment")}}},who:Object(a.a)({on:{RECOGNISED:[{target:"#appointment.help",cond:t=>"help"===t.recResult},{cond:t=>"person"in(y[t.recResult]||{}),actions:Object(i.b)((t=>({person:y[t.recResult].person}))),target:"day"},{target:".nomatch"}],MAXSPEECH:[Object(a.a)(Object(a.a)({},h()),{},{target:".timeoutReprompt"}),Object(a.a)(Object(a.a)({},g()),{},{target:".finalReprompt"})]}},b(m("Who are you meeting with?"),"Sorry I don't know them! Please choose who you're meeting with.",m("You haven't responded yet! Would you please tell us, who you're meeting with?"))),day:Object(a.a)({on:{RECOGNISED:[{target:"#appointment.help",cond:t=>"help"===t.recResult},{cond:t=>"day"in(y[t.recResult]||{}),actions:Object(i.b)((t=>({day:y[t.recResult].day}))),target:"whole_day"},{target:".nomatch"}],MAXSPEECH:[Object(a.a)(Object(a.a)({},h()),{},{target:".timeoutReprompt"}),Object(a.a)(Object(a.a)({},g()),{},{target:".finalReprompt"})]}},b(u((t=>({type:"SPEAK",value:"OK. ".concat(t.person,". On which day is your meeting?")}))),"If you seek an appointment during the weekend, that's not possible. Please choose another day",u((t=>({type:"SPEAK",value:"You haven't responded yet! Now, please choose on which day you want to meet ".concat(t.person,".")}))))),whole_day:Object(a.a)({on:{RECOGNISED:[{target:"#appointment.help",cond:t=>"help"===t.recResult},{cond:t=>!!d[t.recResult]&&!0===d[t.recResult].yes_no,target:"confirm_whole_day"},{cond:t=>!!d[t.recResult]&&!1===d[t.recResult].yes_no,target:"time"},{target:".nomatch"}],MAXSPEECH:[Object(a.a)(Object(a.a)({},h()),{},{target:".timeoutReprompt"}),Object(a.a)(Object(a.a)({},g()),{},{target:".finalReprompt"})]}},b(m("Will it take the whole day?"),"Sorry I don't understand what you said, Can you repeat?",m("You haven't responded yet! Would you please confirm if your meeting is going to last for the whole day?"))),confirm_whole_day:Object(a.a)({initial:"prompt",on:{RECOGNISED:[{target:"#appointment.help",cond:t=>"help"===t.recResult},{cond:t=>!!d[t.recResult]&&!0===d[t.recResult].yes_no,target:"confirm_appointment"},{cond:t=>!!d[t.recResult]&&!1===d[t.recResult].yes_no,target:"who"},{target:".nomatch"}],MAXSPEECH:[Object(a.a)(Object(a.a)({},h()),{},{target:".timeoutReprompt"}),Object(a.a)(Object(a.a)({},g()),{},{target:".finalReprompt"})]}},b(u((t=>({type:"SPEAK",value:"Do you want me to create an appointment with ".concat(t.person," \n                                            on ").concat(t.day," for the whole day?")}))),"Sorry I don't understand what you said, Can you repeat?",u((t=>({type:"SPEAK",value:"\"You haven't responded yet! Would you please confirm your appointment details?\n                            I will create an appointment with ".concat(t.person," on ").concat(t.day," for the whole day, does that work for you?")}))))),time:Object(a.a)({initial:"prompt",on:{RECOGNISED:[{target:"#appointment.help",cond:t=>"help"===t.recResult},{cond:t=>"time"in(y[t.recResult]||{}),actions:Object(i.b)((t=>({time:y[t.recResult].time}))),target:"confirm_time_appointment"},{target:".nomatch"}],MAXSPEECH:[Object(a.a)(Object(a.a)({},h()),{},{target:".timeoutReprompt"}),Object(a.a)(Object(a.a)({},g()),{},{target:".finalReprompt"})]}},b(m("What time is your meeting?"),"Sorry the time you chose is not available. Please choose a different time!",m("What time is your meeting?"))),confirm_time_appointment:Object(a.a)({initial:"prompt",on:{RECOGNISED:[{target:"#appointment.help",cond:t=>"help"===t.recResult},{cond:t=>!!d[t.recResult]&&!0===d[t.recResult].yes_no,target:"confirm_appointment"},{cond:t=>!!d[t.recResult]&&!1===d[t.recResult].yes_no,target:"who"},{target:".nomatch"}],MAXSPEECH:[Object(a.a)(Object(a.a)({},h()),{},{target:".timeoutReprompt"}),Object(a.a)(Object(a.a)({},g()),{},{target:".finalReprompt"})]}},b(u((t=>({type:"SPEAK",value:"Do you want me to create an appointment with ".concat(t.person," \n                                            on ").concat(t.day," at ").concat(t.time,"?")}))),"Sorry I don't understand what you said, Can you repeat?",u((t=>({type:"SPEAK",value:"\"You haven't responded yet! Would you please confirm your appointment details?\n                            I will create an appointment with ".concat(t.person," on ").concat(t.day," at ").concat(t.time,", does that work for you?")}))))),confirm_appointment:{entry:m("Your appointment has been created! See you!"),on:{ENDSPEECH:"#appointment.start.init"}}}},help:{entry:m("Don't panic, we can go one step back!"),on:{ENDSPEECH:"start.hist"}}}};var O=o(22),j=o(13);const R=c.a.send,S=c.a.cancel;Object(l.a)({url:"https://statecharts.io/inspect",iframe:!1});const w=Object(r.a)({id:"root",type:"parallel",states:{dm:Object(a.a)({},E),asrtts:{initial:"idle",states:{idle:{on:{LISTEN:"recognising",SPEAK:{target:"speaking",actions:Object(i.b)(((t,e)=>({ttsAgenda:e.value})))}}},recognising:{initial:"progress",entry:"recStart",exit:"recStop",on:{ASRRESULT:{actions:["recLogResult",Object(i.b)(((t,e)=>({recResult:e.value})))],target:".match"},RECOGNISED:{target:"idle",actions:[S("countdown"),Object(i.b)((t=>({counts:0})))]},MAXSPEECH:"idle"},states:{progress:{},match:{entry:R("RECOGNISED")}}},speaking:{entry:"ttsStart",on:{ENDSPEECH:"idle"}}}}}},{actions:{recLogResult:t=>{console.log("<< ASR: "+t.recResult)},test:()=>{console.log("test")},logIntent:t=>{console.log("<< NLU intent: "+t.nluData.intent.name)}}}),f=t=>{switch(!0){case t.state.matches({asrtts:"recognising"}):return Object(j.jsx)("button",Object(a.a)(Object(a.a)({type:"button",className:"glow-on-hover",style:{animation:"glowing 20s linear"}},t),{},{children:"Listening..."}));case t.state.matches({asrtts:"speaking"}):return Object(j.jsx)("button",Object(a.a)(Object(a.a)({type:"button",className:"glow-on-hover",style:{animation:"bordering 1s infinite"}},t),{},{children:"Speaking..."}));default:return Object(j.jsx)("button",Object(a.a)(Object(a.a)({type:"button",className:"glow-on-hover"},t),{},{children:"Click to start"}))}};function C(){const t=Object(O.useSpeechSynthesis)({onEnd:()=>{u("ENDSPEECH")}}),e=t.speak,o=t.cancel,a=(t.speaking,Object(O.useSpeechRecognition)({onResult:t=>{u({type:"ASRRESULT",value:t})}})),s=a.listen,c=(a.listening,a.stop),r=Object(p.b)(w,{devTools:!0,actions:{recStart:Object(p.a)((()=>{console.log("Ready to receive a command."),s({interimResults:!1,continuous:!0})})),recStop:Object(p.a)((()=>{console.log("Recognition stopped."),c()})),changeColour:Object(p.a)((t=>{console.log("Repainting..."),document.body.style.background=t.recResult})),ttsStart:Object(p.a)(((t,o)=>{console.log("Speaking..."),e({text:t.ttsAgenda})})),ttsCancel:Object(p.a)(((t,e)=>{console.log("TTS STOP..."),o()}))}}),i=Object(n.a)(r,3),l=i[0],u=i[1];i[2];return Object(j.jsx)("div",{className:"App",children:Object(j.jsx)(f,{state:l,onClick:()=>u("CLICK")})})}const _=document.getElementById("root");s.render(Object(j.jsx)(C,{}),_)}},[[40,1,2]]]);
//# sourceMappingURL=main.ba06a6c6.chunk.js.map