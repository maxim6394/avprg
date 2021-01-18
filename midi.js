//================= MIDI VERBINDUNG ==============================================================================
function initialize(){
	if (navigator.requestMIDIAccess) {
		navigator.requestMIDIAccess()
			.then(success, failure);
	}

	// Initialisiert WebMIDI
	function success (midi) {
		createUI(midi.inputs);

		// liefert Liste der MIDI-Input Ports
		function findInputPort(name){
			let selectedInput = null;
			midi.inputs.forEach(function(input, key){
				if (input.name == name){
					selectedInput = input;
				}
			});
			return selectedInput;
		}

		// initialisiert einen MIDI-Input Port 
		function initInputPort(name){
			const input = findInputPort(name);
			if (input){
				input.addEventListener('midimessage', onMIDIMessage);
			}
		}

	}
	
	function failure () {
		console.error('No access to your midi devices.')
	}

	function onMIDIMessage(event) {
		// event.data is an array
		// event.data[0] = on (144) / off (128) / controlChange (176)  / pitchBend (224) / ...
		// event.data[1] = midi note
		// event.data[2] = velocity
	
		switch (event.data[0]) {
		case 144:
			// your function startNote(note, velocity)
			startNote(event.data[1], event.data[2]);
			break;
		case 128:
			// your function stopNote(note, velocity)
			stopNote(event.data[1], event.data[2]);
			break;
		}
	}
}