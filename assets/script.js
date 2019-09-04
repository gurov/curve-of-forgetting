
const CLIENT_ID = '1010875399447-ehum871o7au04jrkav1kokanokncuv47.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBMQC261rFFww--waXEj5e4nyAF4-bhtto';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events";

const loader = document.getElementById('loader');

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    loader.toggleAttribute('hidden', false);
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        document.getElementById('authorize_button').onclick = handleAuthClick;
        document.getElementById('signout_button').onclick = handleSignoutClick;
        document.getElementById('submit-button').onclick = submitEvents;
    }, function (error) {
        appendPre(JSON.stringify(error, null, 2));
        loader.toggleAttribute('hidden', true);
    });
}

function updateSigninStatus(isSignedIn) {

    if (isSignedIn) {
        document.getElementById('authorize_button').toggleAttribute('hidden', true);
        document.getElementById('signout_button').toggleAttribute('hidden', false);
        document.getElementById('signout_button').toggleAttribute('hidden', false);
        document.getElementById('text-form').toggleAttribute('hidden', false);
        document.getElementById('blockquote').toggleAttribute('hidden', true);
    } else {
        document.getElementById('authorize_button').toggleAttribute('hidden', false);
        document.getElementById('signout_button').toggleAttribute('hidden', true);
        document.getElementById('text-form').toggleAttribute('hidden', true);
    }
    loader.toggleAttribute('hidden', true);
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function appendPre(message) {
    const pre = document.getElementById('content');
    const textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}

function appendSuccess(date, link) {
    const eventsDiv = document.getElementById('events');
    const t = document.createTextNode('Event created: ');;
    const a = document.createElement('a');
    const linkText = document.createTextNode(date);
    a.appendChild(linkText);
    a.href = link;
    a.target = "_blank";
    const br = document.createElement('br');

    eventsDiv.appendChild(t);
    eventsDiv.appendChild(a);
    eventsDiv.appendChild(br);
}

function getISODate(sec) {
    const today = new Date();
    return new Date(+today + 1000 * (60 * 60 * 24 + (sec || 0))).toISOString();
}

function genEvent(sec, text) {
    const title = text.length > 47
            ? text.substr(0, 47) + '...'
            : text;
    return {
        summary: `CoF: ${title}`,
        description: text,
        start: {
            dateTime: getISODate(sec),
        },
        end: {
            dateTime: getISODate(sec + 10 * 60),
        },
        reminders: {
            useDefault: false,
            overrides: [
                {method: 'popup', minutes: 2}
            ]
        }
    };
}

function submitEvents() {
    const textEl = document.getElementById('textToMemorize');
    if (textEl.value.length < 1) {
        alert('The text is too short');
        return;
    }
    loader.toggleAttribute('hidden', false);

    const DAY = 24 * 3600;

    const secOffsets = [
        60 * 20,
        DAY + 60 * 20,
        DAY * 12 + DAY + 60 * 20,
        DAY * 62 + DAY * 12 + DAY + 60 * 20,
        DAY * 365 + DAY * 62 + DAY * 12 + DAY + 60 * 20,
    ];

    let loaderCounter = 0;

    for (let i = 1; i < 6; i++) {
        if (document.getElementById('checkbox' + i).checked) {
            const event = genEvent(secOffsets[i - 1], textEl.value);
            const request = gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: event
            });
            loaderCounter = loaderCounter + 1;

            request.execute((event) => {
                loaderCounter = loaderCounter - 1;
                if (loaderCounter < 1) {
                    loader.toggleAttribute('hidden', true);
                }
                appendSuccess(event.start.dateTime, event.htmlLink)
            });
        }
    }
    textEl.value = '';
}