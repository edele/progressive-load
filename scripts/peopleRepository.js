const decoder = new TextDecoder();
let partialLine = '';

class PeopleRepository {
    constructor() {
        this.url = '/people.csv';
        this.csvLines = [];

        this.onError = () => {};
        this.onChunkReceived = () => {};
        this.onDoneReceiving = () => {};
    }

    fetch() {
        fetch(this.url)
        .then(response => {
            const reader = response.body.getReader();

            const readChunk = () => {
                return reader.read().then(result => {
                    partialLine += decoder.decode(result.value || new Uint8Array, {
                        stream: !result.done
                    });

                    let completeLines = partialLine.split("\n");

                    if (!result.done) {
                        partialLine = completeLines[completeLines.length - 1];
                        completeLines = completeLines.slice(0, -1);
                    }

                    Array.prototype.push.apply(this.csvLines, completeLines)
                    this.onChunkReceived(completeLines);

                    if (result.done) {
                        this.onDoneReceiving(this.csvLines);
                        return;
                    }

                    return readChunk();
                })
            }

            return readChunk();
        })
        .catch(err => {
            this.onError(err);
        });
    }
}

export default new PeopleRepository();
