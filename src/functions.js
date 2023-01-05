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
            exportable: false,
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
            species_comment: f.species_comment || "",
            static_map: f.static_map || {},
        };
        f.static_map = {
            display: f.static_map.lat || true,
            path: f.static_map.lat || null,
            zoom: f.static_map.lat || null,
            lon: f.static_map.lat || null,
            lat: f.static_map.lat || null,
        };
        return f;
    },
    /*distance(lat1, lon1, lat2, lon2) {
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
    },*/
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
}