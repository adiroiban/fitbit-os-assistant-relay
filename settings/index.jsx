function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Assistant Relay Location</Text>}
        description={<Text>Will use HTTP and you must use <Text bold>IP address</Text>.</Text>}>
        <TextInput
          label="IP:PORT"
          value={props.settings.address}
          onChange={value => props.settingsStorage.setItem('address', value.name)}
        />
        <Button
          label="Test"
          onClick={() => {
            props.settingsStorage.setItem('test', 'trigger-test');
            props.settingsStorage.removeItem('test')
            }}
        />
      </Section>
      <Section
        title={<Text bold align="center">On/Off Things</Text>}
        description={<Text>Names of the things which can be turned on/off.<Text italic> Plugs, rooms, or non-dimmable lights.</Text></Text>}
        >
        <AdditiveList
          settingsKey="things_on_off"
          title="Managed things"
        />
      </Section>
      <Section
        title={<Text bold align="center">Dimmable Things</Text>}
        description={<Text>Names of the things which can be dimmed.</Text>}
        >
        <AdditiveList
          settingsKey="things_dimmable"
          title="Managed things"
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
