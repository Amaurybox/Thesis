

const TRYTE_ALPHABET = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const asciiToTrytes = (input) => {
    let trytes = '';
    for (let i = 0; i < input.length; i++) {
        var dec = input[i].charCodeAt(0);
        trytes += TRYTE_ALPHABET[dec % 27];
        trytes += TRYTE_ALPHABET[(dec - dec % 27) / 27];
    }
    return trytes;
};

const trytesToAscii = (trytes) => {
    let ascii = '';
    for (let i = 0; i < trytes.length; i += 2) {
        ascii += String.fromCharCode(TRYTE_ALPHABET.indexOf(trytes[i]) + TRYTE_ALPHABET.indexOf(trytes[i + 1]) * 27);
    }
    return ascii;
};

(async function () {
    const mode = 'public'
    const provider = 'https://nodes.devnet.iota.org'

    const mamExplorerLink = `https://mam-explorer.firebaseapp.com/?provider=${encodeURIComponent(provider)}&mode=${mode}&root=`

    const outputHtml = document.querySelector("#output");

    // Initialise MAM State
    let mamState = Mam.init(provider)

    // Publish to tangle
    const publish = async packet => {
        // Create MAM Payload - STRING OF TRYTES
        const trytes = asciiToTrytes(JSON.stringify(packet))
        const message = Mam.create(mamState, trytes)

        // Save new mamState
        mamState = message.state

        // Attach the payload
        await Mam.attach(message.payload, message.address, 3, 9)

        outputHtml.innerHTML += `Published: ${packet}<br/>`;
        return message.root
    }

    const publishAll = async () => {
        const root = await publish('ALICE')

        await publish('BOB')

        await publish('CHARLIE')

        return root
    }

    // Callback used to pass data out of the fetch
    const logData = data => outputHtml.innerHTML += `Fetched and parsed ${JSON.parse(trytesToAscii(data))}<br/>`;

    const root = await publishAll();

    // Output asyncronously using "logData" callback function
    await Mam.fetch(root, mode, null, logData)

    // Output syncronously once fetch is completed
    const result = await Mam.fetch(root, mode)
    result.messages.forEach(message => {
        outputHtml.innerHTML += `Fetched and parsed ${JSON.parse(trytesToAscii(message))}<br/>`
    });

    outputHtml.innerHTML += `Verify with MAM Explorer:<br/><a target="_blank" href="${mamExplorerLink}${root}">${mamExplorerLink}${root}</a>`;
})();