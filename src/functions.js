export default {
    formatNb(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    mode(arr) {
        return arr
            .sort((a, b) => arr.filter((v) => v === a).length - arr.filter((v) => v === b).length)
            .pop();
    },
    object2Table(s) {
        return Object.entries(s).map(([k, v]) => {
            return { Properties: k, Value: v };
        });
    },
    createForm(f, id) {
        return {
            id: id, // required
            imported: f.imported || false,
            exportable: f.exportable || false,
            location_name: f.location_name || "New List " + id,
            lat: f.lon ? (Math.round(parseFloat(f.lat) * 1e6) / 1e6) : null,
            lon: f.lat ? (Math.round(parseFloat(f.lon) * 1e6) / 1e6) : null,
            date: f.date || "",
            time: f.time ? f.time.substring(0, 5) : "",
            duration: f.duration || "",
            distance: f.distance || "",
            number_observer: f.number_observer || "",
            full_form: f.full_form || false,
            primary_purpose: f.primary_purpose || false,
            checklist_comment: f.checklist_comment || "",
            species_comment_template: f.species_comment_template || "",
            path: f.path || null,
            static_map: f.static_map || true,
        };
    },
    createSighting(s) {
        return {
            id: s.id, // required
            form_id: s.form_id, // required
            location_name: s.location_name, // required
            lat: (Math.round(parseFloat(s.lat) * 1e6) / 1e6),// required
            lon: (Math.round(parseFloat(s.lon) * 1e6) / 1e6),// required
            date: s.date, // required
            time: s.time ? s.time.substring(0, 5) : "",
            common_name: s.common_name || "",
            scientific_name: s.scientific_name || "",
            count: s.count || null,
            count_precision: s.count_precision || "",
            comment: s.comment || "",
        };
    },
    protocol(f) {

        const protocol = {
            invalid: {
                name: "Invalid",
                letter: "X",
                variant: "danger",
                title: "Your checklist is currently not acceptable for eBird. You are probably missing a Date."
            },
            incidental: {
                name: "Incidental",
                letter: "I",
                variant: "warning",
                title: "Incidental protocol is used when birding was not you primary purpose. The checklist will have little value."
            },
            historical: {
                name: "Historical",
                letter: "H",
                variant: "warning",
                title: "Can you add all effort information (time, duration, party size and distance)? This would really improve the value of your data!"
            },
            invalid: {
                name: "Stationary",
                letter: "S",
                variant: "success",
                title: "Great, stationary protocol are the best value!"
            },
            invalid: {
                name: "Traveling",
                letter: "T",
                variant: "success",
                title: "Nice! the traveling protocol is ideal!"
            },
        }

        console.log(f)
        if (!f.date) {
            return protocol.invalid;
        }
        if (f.primary_purpose) {
            if (
                !!f.time &&
                parseFloat(f.distance) >= 0 &&
                parseFloat(f.duration) > 0 &&
                parseFloat(f.number_observer) > 0
            ) {
                if (f.distance > 0) {
                    return protocol.traveling;
                } else {
                    return protocol.stationary;
                }
            } else {
                return protocol.historical;
            }
        } else {
            return protocol.incidental;
        }
    },
    async copyClipboard(mytext) {
        try {
            await navigator.clipboard.writeText(mytext);
            alert('Copied to clipboard');
        } catch ($e) {
            alert('Cannot copy. Try manually.');
        }
    },
    csvToArray(str, delimiter = ",") {
        const headers = str.slice(0, str.indexOf("\n")).split(delimiter).map(x => x.replaceAll('"', ""));
        const rows = str.slice(str.indexOf("\n") + 1).split("\n").filter(row => row.length > 0);
        return rows.map(function (row) {
            const values = row.split(delimiter).map(x => x.replaceAll('"', ""));
            const el = headers.reduce(function (object, header, index) {
                object[header] = values[index];
                return object;
            }, {});
            return el;
        });
    }
}