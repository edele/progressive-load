const people = [];
const peoplePerPage = 500;
let alreadyOnPage = 0;

const listEl = document.getElementById('people-list');
const paginationEl = document.getElementById('people-pagination');
const statusEl = document.getElementById('load-status');
let renders = 0;

function loadNextPage() {
    const needsToLoadNextPage = alreadyOnPage < people.length;

    if (needsToLoadNextPage) {
        const pageHtml = people.slice(alreadyOnPage, alreadyOnPage + peoplePerPage).map(person => {
            return `<tr>
                <td>${person.number}</td>
                <td>${person.name}</td>
                <td>${person.address}</td>
                <td>${person.phone}</td>
            </tr>`;
        }).join('');

        listEl.insertAdjacentHTML('beforeend', pageHtml);

        alreadyOnPage += peoplePerPage;
    }
}

function scrollHandler() {
    const bottomMargin = 500;
    const threshold = window.innerHeight + bottomMargin;
    const body = document.body;
    const isApproachingTheBottom = body.scrollHeight <= body.scrollTop + window.innerHeight + threshold;

    if (isApproachingTheBottom) {
        loadNextPage();
    }
}

let linesCount = 0;
function parseCSVLines(newLines) {
    newLines.forEach(line => {
        const [ name, address, phone ] = line.split(',');
        people.push({ number: linesCount, name, address, phone });
        linesCount++;
    });

    statusEl.innerHTML = `loading... <br> ${people.length}`;

    const needsToRenderInitialPage = alreadyOnPage < peoplePerPage && people.length >= peoplePerPage;
    if (needsToRenderInitialPage) {
        loadNextPage();
    }
}

document.onscroll = scrollHandler;

fetch('/people.csv').then(response => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let partialLine = '';

    function readChunk() {
        return reader.read().then(result => {
            partialLine += decoder.decode(result.value || new Uint8Array, {
                stream: !result.done
            });

            let completeLines = partialLine.split("\n");

            if (!result.done) {
                partialLine = completeLines[completeLines.length - 1];
                completeLines = completeLines.slice(0, -1);
            }

            parseCSVLines(completeLines);

            if (result.done) {
                statusEl.innerHTML = `done! <br> ${people.length}`;
                return;
            }

            return readChunk();
        })
    }

    return readChunk();
}).catch(err => {
    alert(err.message);
});
