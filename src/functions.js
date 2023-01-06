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
            location_name: f.location_name || "New List " + f.id,
            lat: f.lat || null,
            lon: f.lon || null,
            date: f.date || "",
            time: f.time || "",
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
            location_name: s.location_name,
            lat: s.lat || null,
            lon: s.lon || null,
            date: s.date || "",
            time: s.time || "",
            common_name: s.common_name || "",
            scientific_name: s.scientific_name || "",
            count: s.count || null,
            count_precision: s.count_precision || "",
            comment: s.comment || "",
        };
    },
    protocol(f) {
        if (!f.date) {
            return "invalid";
        }
        if (f.primary_purpose) {
            if (
                !!f.time &&
                parseFloat(f.distance) >= 0 &&
                parseFloat(f.duration) > 0 &&
                parseFloat(f.number_observer) > 0
            ) {
                if (f.distance > 0) {
                    return "traveling";
                } else {
                    return "stationary";
                }
            } else {
                return "historical";
            }
        } else {
            return "incidental";
        }
    },
    protocol_variant(p) {
        switch (p) {
            case "traveling":
                return "success";
            case "stationary":
                return "success";
            case "warning":
                return "success";
            case "incidental":
                return "warning";
            case "invalid":
                return "danger";
        }
    },
    async copyClipboard(mytext) {
        try {
            await navigator.clipboard.writeText(mytext);
            alert('Copied to clipboard');
        } catch ($e) {
            alert('Cannot copy. Try manually.');
        }
    }
}