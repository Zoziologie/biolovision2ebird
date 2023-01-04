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
    distance(lat1, lon1, lat2, lon2) {
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(Math.PI * (lon1 - lon2) / 180);
            if (dist > 1) {
                dist = 1;
            }
            return Math.acos(dist) * 180 / Math.PI * 60 * 1.1515 * 1.609344
        }
    }
}