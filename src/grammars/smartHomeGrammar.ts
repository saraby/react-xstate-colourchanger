
export const grammar =`
<grammar root="command">
    <rule id="command">
        <ruleref uri="#order"/>
        <tag>out.command = new Object();
            out.command.action=rules.order.action;
            out.command.object=rules.order.object;
        </tag>

     </rule>
    <rule id="order">
        <item repeat="0-1">
            please
        </item>
        <one-of>
            <item>turn the
                <ruleref uri="#objects_turn"/>
                <tag>out.object=rules.objects_turn;</tag>
                <ruleref uri="#actions_turn"/>
                <tag>out.action="turn "+rules.actions_turn;</tag>
            </item>
            <item>turn
                <ruleref uri="#actions_turn"/>
                <tag>out.action="turn "+rules.actions_turn;</tag>
                the
                <ruleref uri="#objects_turn"/>
                <tag>out.object=rules.objects_turn;</tag>
            </item>
            <item>
                <ruleref uri="#actions_OC"/>
                <tag>out.action=rules.actions_OC;</tag>
                the
                <ruleref uri="#objects_OC"/>
                <tag>out.object=rules.objects_OC;</tag>
            </item>
        </one-of>
    </rule>

    <rule id="actions_turn">
        <one-of>
            <item>on</item>
            <item>off</item>
        </one-of>
    </rule>
    <rule id="actions_OC">
        <one-of>
            <item>close</item>
            <item>open</item>
        </one-of>
    </rule>
    <rule id="objects_OC">
        <one-of>
            <item>window</item>
            <item>door</item>
        </one-of>
    </rule>
    <rule id="objects_turn">
        <one-of>
            <item>light</item>
            <item>heat</item>
            <item>air conditioning</item>
            <item> AC <tag> out = 'air conditioning'; </tag></item>
        </one-of>
    </rule>
</grammar>
`