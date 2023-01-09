import Vue from "vue";
import App from './App.vue'

import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

import VueCookie from "vue-cookie";
Vue.use(VueCookie);



Vue.mixin({
    data() {
        return {
            mapbox_access_token:
                "pk.eyJ1IjoicmFmbnVzcyIsImEiOiJjbGNsNWtyNm01enhnM3hsazNmamQ5dm5hIn0.DonKVX7CLLfMHIZiiSbYnQ"

        }
    },
    methods: {
        formatNb(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        mathMode(arr) {
            return arr
                .sort((a, b) => arr.filter((v) => v === a).length - arr.filter((v) => v === b).length)
                .pop();
        },
        mathRound(x, exp) {
            return x ? (Math.round(parseFloat(x) * Math.pow(10, exp)) / Math.pow(10, exp)) : x
        },
        formatDate(date, sep = "-") {
            date = new Date(date)
            return (date.getMonth() > 8 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)) +
                sep +
                (date.getDate() > 9 ? date.getDate() : "0" + date.getDate()) +
                sep +
                date.getFullYear();
        },
        object2Table(s) {
            return Object.entries(s).map(([k, v]) => {
                return { Properties: k, Value: v };
            });
        },
        copyClipboard(mytext) {
            try {
                //await navigator.clipboard.writeText(mytext);
                alert('Copied to clipboard');
            } catch ($e) {
                alert('Cannot copy. Try manually.');
            }
        },
        createForm(f, id) {
            let species_comment_template = f.species_comment_template || {}
            species_comment_template.long = f.species_comment_template.long || ""
            species_comment_template.short = f.species_comment_template.short || ""
            species_comment_template.limit = f.species_comment_template.limit || 5

            return {
                id: id, // required
                imported: f.imported || false,
                exportable: f.exportable || false,
                location_name: f.location_name || "New List " + id,
                lat: this.mathRound(f.lat, 6),
                lon: this.mathRound(f.lon, 6),
                date: f.date || "",
                time: f.time ? f.time.substring(0, 5) : "",
                duration: f.duration || "",
                distance: f.distance || "",
                number_observer: f.number_observer || "",
                full_form: f.full_form || false,
                primary_purpose: f.primary_purpose || false,
                checklist_comment: f.checklist_comment || "",
                species_comment_template: species_comment_template,
                path: f.path || null,
                path_distance: null,
                static_map: {
                    in_checklist_comment: true,
                    style: "satellite-v9",
                    bounding_box_auto: true,
                    bounding_box: null,
                    size: [300, 200],
                    include_path: true,
                    path_style: {
                        strokeWidth: "5",
                        strokeColor: "#AD8533",
                        strokeOpacity: "1"
                    },
                    marker_style: {
                        "marker-size": "small",
                        "marker-symbol": "circle",
                        "marker-color": "#808080"
                    }
                },
            };
        },
        createSighting(s) {
            return {
                id: s.id, // required
                form_id: s.form_id, // required
                location_name: s.location_name, // required
                lat: this.mathRound(s.lat, 6),// required
                lon: this.mathRound(s.lon, 6),// required
                date: s.date, // required
                time: s.time ? s.time.substring(0, 5) : "",
                common_name: s.common_name || "",
                scientific_name: s.scientific_name || "",
                count: s.count || null,
                count_precision: s.count_precision || "",
                comment: s.comment || "",
            };
        },
        distanceFromLatLngs(latlngs) {
            if (Array.isArray(latlngs) && !(latlngs[0] instanceof L.LatLng)) {
                latlngs = L.polyline(latlngs)
            }
            if (latlngs instanceof L.Polyline) {
                latlngs = latlngs.getLatLngs()
            }
            return this.mathRound(
                latlngs.reduce(
                    (acc, latlng) => {
                        return [acc[0] + acc[1].distanceTo(latlng), latlng];
                    },
                    [0, latlngs[0]]
                )[0] / 1000, 2
            )
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
                stationary: {
                    name: "Stationary",
                    letter: "S",
                    variant: "success",
                    title: "Great, stationary protocol are the best value!"
                },
                traveling: {
                    name: "Traveling",
                    letter: "T",
                    variant: "success",
                    title: "Nice! the traveling protocol is ideal!"
                },
            }
            if (!f.date || f.duration >= 1440) {
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
        checklistComment(form, sightings) {
            return (
                form.checklist_comment +
                (form.static_map.in_checklist_comment
                    ? `<img src="${this.staticMapLink(
                        form,
                        sightings
                    )}" style="max-width:300px;width:100%">`
                    : "") +
                "<br/><small>Imported with <a href='https://zoziologie.raphaelnussbaumer.com/biolovision2ebird/'>biolovision2eBird</a>.</small>"
            );
        },
        staticMapLink(form, sightings) {
            // Create path
            let path = "";
            if (form.path && form.path.length > 0 && form.static_map.include_path) {
                const path_simplified = L.LineUtil.simplify(
                    form.path.map((x) => {
                        return { x: x[0], y: x[1] };
                    }),
                    0.00001
                ).map((x) => [x.x, x.y]);

                const path_encodeded = L.PolylineUtil.encode(path_simplified, 5);

                const style = form.static_map.path_style;
                path = `path-${style.strokeWidth}+${style.strokeColor.slice(1, style.strokeColor.length)}-${style.strokeOpacity
                    }(${encodeURIComponent(path_encodeded)}),`;
            }

            // Create sightings markers
            const sightings_simplified = L.LineUtil.simplify(
                sightings.map((x) => {
                    return { x: x.lat, y: x.lon };
                }),
                sightings.length > 100 ? 0.001 : 0.0001
            ).map((x) => [x.x, x.y]);

            let sightings_geojson = L.polyline(sightings_simplified).toGeoJSON();
            sightings_geojson.geometry.type = "MultiPoint";
            sightings_geojson.properties = form.static_map.marker_style;
            sightings_geojson.geometry.coordinates = sightings_geojson.geometry.coordinates.map((c) => [
                this.mathRound(c[0], 4),
                this.mathRound(c[1], 4),
            ]);

            const markers = "geojson(" + encodeURIComponent(JSON.stringify(sightings_geojson)) + ")";

            return `https://api.mapbox.com/styles/v1/mapbox/${form.static_map.style
                }/static/${path}${markers}/${form.static_map.bounding_box_auto ? "auto" : "[" + form.static_map.bounding_box + "]"
                }/300x200?access_token=${this.mapbox_access_token}&logo=false`;
        },
        speciesComment(species_comment_template, sightings) {
            if (sightings.length < species_comment_template.limit) {
                var sep = "<br/>"
                var cmt = species_comment_template.short;
            } else {
                var sep = ", "
                var cmt = species_comment_template.long;
            }
            return sightings.map(s => {
                return cmt.split('${').map((str, id) => {
                    if (id == 0) {
                        return str
                    }
                    let tmp = str.split('}')
                    try {
                        return String(eval(tmp[0])).replace(/(?:\r\n|\r|\n)/g, '<br>') + tmp[1]
                    } catch {
                        return tmp[1]
                    }
                }).join("")
            }).join(sep)
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
})

new Vue({
    render: (h) => h(App),
}).$mount("#app");