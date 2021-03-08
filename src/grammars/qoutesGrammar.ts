export const grammar = `
<grammar root="quote">
   <rule id="quote">
      <ruleref uri="#sentence"/>
      <tag>out.quote=rules.sentence;</tag>
   </rule>
   <rule id="sentence">
      <one-of>
           <item>to do is to be <tag>out.by='Socrates'</tag></item>
           <item>to be is to do <tag>out.by='Sartre'</tag></item>
           <item>do be do be do <tag>out.by='Sinatra'</tag></item>
      </one-of>
   </rule>
</grammar>
`