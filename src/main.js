import Vue from "vue";
import App from './App.vue'

import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

import VueCookie from "vue-cookie";
Vue.use(VueCookie);



Vue.mixin({
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
            date = new Date(date + " 00:00")
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
                navigator.clipboard.writeText(mytext).then(function (x) {
                    alert("Link copied to clipboard: " + mytext);
                });
            } catch {
                alert('Cannot copy. Try manually.');
            }
        },
        distanceFromLatLngs(latlngs) {
            if (latlngs == null) {
                return null // if no path were defined before
            }
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
            let comment = form.checklist_comment
            if (form.static_map.show) {
                const img = `<img src="${this.staticMapLink(
                    form,
                    sightings
                )}" style="max-width:300px;width:100%">`
                if (form.static_map.gist) {
                    comment += "<a href='" + form.static_map.gist + "'>" + img + "</a>"
                } else {
                    comment += img
                }
            }
            return comment + "<br/><small>Imported with <a href='https://zoziologie.raphaelnussbaumer.com/biolovision2ebird/'>biolovision2eBird</a>.</small>"
        },
        staticMapLink(form, sightings) {

            // Create the sightings markers
            // get fewer markers but "simplifying" a path created from the markers. 
            const sightings_simplified = L.LineUtil.simplify(
                sightings.map((x) => {
                    return { x: x.lat, y: x.lon };
                }),
                sightings.length > 100 ? 0.001 : 0.0001
            ).map((x) => [x.x, x.y]);
            // Convert sightings to a geojson format
            let sightings_geojson = L.polyline(sightings_simplified).toGeoJSON();
            // change polyline to multipoint
            sightings_geojson.geometry.type = "MultiPoint";
            // Add markes style
            sightings_geojson.properties = form.static_map.marker_style;
            // round the position to 4 digits (~1-10m precision)
            sightings_geojson.geometry.coordinates = sightings_geojson.geometry.coordinates.map((c) => [
                this.mathRound(c[0], 4),
                this.mathRound(c[1], 4),
            ]);
            const markers = "geojson(" + encodeURIComponent(JSON.stringify(sightings_geojson)) + ")";
            // Compute the bounds of the sightings
            let bounds = L.latLngBounds(sightings.map((s) => L.latLng(s.lat, s.lon)))

            // Create path
            let path = "";
            if (form.path && form.path.length > 0 && form.static_map.include_path) {
                // Simmplifly path to 5 digits
                const path_simplified = L.LineUtil.simplify(
                    form.path.map((x) => {
                        return { x: x[0], y: x[1] };
                    }),
                    0.00001
                ).map((x) => [x.x, x.y]);
                // Encode to
                const path_encodeded = L.PolylineUtil.encode(path_simplified, 5);
                // Add style and encode for URI
                const style = form.static_map.path_style;
                path = `path-${style.strokeWidth}+${style.strokeColor.slice(1, style.strokeColor.length)}-${style.strokeOpacity
                    }(${encodeURIComponent(path_encodeded)}),`;
                // Extend the bound of the map for path
                bounds = bounds.extend(L.polyline(form.path).getBounds())
            }

            // Compute auto-bound with a min 500m windows.
            if (form.static_map.bounding_box_auto) {
                const dlat = 1 / 111151 * 500; // °/m@46° /100m
                const dlon = 1 / 77463 * 500; // °/m@46°  /100m
                let s = bounds.pad(.1).getSouth()
                let n = bounds.pad(.3).getNorth()
                let e = bounds.pad(.2).getEast()
                let w = bounds.pad(.2).getWest()
                if ((n - s) < dlat) {
                    let c = (n + s) / 2
                    n = c + dlat / 2
                    s = c - dlat / 2
                }
                if ((w - e) < dlon) {
                    let c = (e + w) / 2;
                    w = c - dlon / 2
                    e = c + dlon / 2
                }
                form.static_map.bounding_box = `${w},${s},${e},${n}`
            }

            return `https://api.mapbox.com/styles/v1/mapbox/${form.static_map.style
                }/static/${path}${markers}/[${form.static_map.bounding_box}]/300x200?access_token=${form.static_map.mapbox_token}&logo=false`;
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
    }
})

new Vue({
    render: (h) => h(App),
}).$mount("#app");