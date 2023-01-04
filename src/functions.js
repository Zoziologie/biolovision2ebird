export default {
    formatNb: function (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    mode: function (arr) {
        return arr
            .sort((a, b) => arr.filter((v) => v === a).length - arr.filter((v) => v === b).length)
            .pop();
    },
    object2Table: function (s) {
        return Object.entries(s).map(([k, v]) => {
            return { Properties: k, Value: v };
        });
    },
    createForm(f, id) {
        f = {
            id: id,
            imported: f.imported || false,
            location_name: f.location_name || "New List " + f.id,
            lat: f.lat || null,
            lon: f.lon || null,
            datetime: f.datetime || null,
            duration: f.duration || null,
            distance: f.distance || null,
            number_observer: f.number_observer || null,
            full_form: f.full_form || false,
            primary_purpose: f.primary_purpose || false,
            checklist_comment: f.checklist_comment || "",
            species_comment: f.species_comment || "",
            static_map: f.static_map || {},
        };
        f.static_map = {
            path: f.static_map.lat || null,
            display: f.static_map.lat || true,
            zoom: f.static_map.lat || null,
            lon: f.static_map.lat || null,
            lat: f.static_map.lat || null,
        };
        return f;
    },
}