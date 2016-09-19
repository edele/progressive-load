import peopleRepository from './peopleRepository'

peopleRepository.onChunkReceived = parseCSVLines;

peopleRepository.onDoneReceiving = lines => {
    progressBarEl.innerHTML = `done loading ${lines.length} records from csv file`;
}

peopleRepository.fetch();

const people = [];
const peoplePerPage = 500;
const peopleTotal = 500000;
let alreadyOnPage = 0;

const listEl = document.getElementById('people-list');
function loadNextPage() {
    const hasRecordsToRender = alreadyOnPage < people.length;

    if (!hasRecordsToRender) return;

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

let linesCount = 0;
const progressBarEl = document.getElementById('progress-bar');
function parseCSVLines(newLines) {
    newLines.forEach(line => {
        const [ name, address, phone ] = line.split(',');
        people.push({ number: linesCount, name, address, phone });
        linesCount++;
    });

    progressBarEl.innerHTML = `loading... ${people.length} records from csv file`;
    const loadPercent = people.length / peopleTotal * 100;
    progressBarEl.style.width = String(loadPercent) + '%';

    const needsToRenderInitialPage = alreadyOnPage < peoplePerPage && people.length >= peoplePerPage;
    if (needsToRenderInitialPage) {
        loadNextPage();
    }
}

document.onscroll = () => {
    const bottomMargin = 500;
    const threshold = window.innerHeight + bottomMargin;
    const body = document.body;
    const isApproachingTheBottom = body.scrollHeight <= body.scrollTop + window.innerHeight + threshold;

    if (isApproachingTheBottom) {
        loadNextPage();
    }
}
