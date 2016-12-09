
// Load conversion taxonomie biolovision - eBird
var eBird_birds_list;
jQuery.getJSON("http://zoziologie.raphaelnussbaumer.com/wp-content/plugins/biolovision2eBird/patch_ornitho2eBird.json", function(data){
	eBird_birds_list = data;
});

// Variable to put in workspace
var data, meta, csv_content, d, matchCode, reader, code_list=[],eBird_label=[],table=[],modalmap,modalsLayer, modalfLayer;

var marker_color = [['red','#D63E2A'], ['orange','#f69730'], ['green','#72B026'], ['blue','#38A9DC'], ['purple','#CD50B5'], ['darkred','#A23336'], ['darkgreen','728224'], ['darkpuple','#593869'], ['cadetblue','#436877']];

function color(s,form){
	color_gradient = ['#fff','#352A87', '#363093', '#3637A0', '#353DAD', '#3243BA', '#2C4AC7', '#2053D4', '#0F5CDD', '#0363E1', '#0268E1', '#046DE0', '#0871DE', '#0D75DC', '#1079DA', '#127DD8', '#1481D6', '#1485D4', '#1389D3', '#108ED2', '#0C93D2', '#0998D1', '#079CCF', '#06A0CD', '#06A4CA', '#06A7C6', '#07A9C2', '#0AACBE', '#0FAEB9', '#15B1B4', '#1DB3AF', '#25B5A9', '#2EB7A4', '#38B99E', '#42BB98', '#4DBC92', '#59BD8C', '#65BE86', '#71BF80', '#7CBF7B', '#87BF77', '#92BF73', '#9CBF6F', '#A5BE6B', '#AEBE67', '#B7BD64', '#C0BC60', '#C8BC5D', '#D1BB59', '#D9BA56', '#E1B952', '#E9B94E', '#F1B94A', '#F8BB44', '#FDBE3D', '#FFC337', '#FEC832', '#FCCE2E', '#FAD32A', '#F7D826', '#F5DE21', '#F5E41D', '#F5EB18', '#F6F313', '#F9FB0E'];
	var t = moment(s.observers.observer.timing["@ISO8601"]).hour()*60+moment(s.observers.observer.timing["@ISO8601"]).minute();
	var start = moment(form.date).hour()*60+moment(form.date).minute();
	var r = Math.round(  (t - start )/form.duration * (color_gradient.length-1) )+1;
	r= (r<0) ? 0 : r;
	r= (r>=color_gradient.length) ? color_gradient.length-1 : r;
	return color_gradient[r].split('#')[1]
}


// JSON to CSV Converter
function ConvertToCSV(objArray) {
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
	var str = '';
	for (var i = 0; i < array.length; i++) {
		var line = '';
		for (var index in array[i]) {
			if (line != '') line += ','
				line += '"'+array[i][index]+'"';
		}
		str += line + '\r\n';
	}
	return str;
}

function setLoc(id, h){
	jQuery('#f-'+id+' #location').val(h)
	jQuery('#li-f-'+id+' a').html(h)
	var form = jQuery.grep(data.forms, function(e){ return e.id == id; });
	form.name = h;
}

function setDist(id,dist){
	jQuery('#f-'+id+' #distance').val(dist)
	jQuery('#f-'+id+' #observation-type').val('Traveling')
}

function updatePreview(form){
	var html = jQuery('#f-'+form.id+' #comments').val() +'<br>';
	if (jQuery('#f-'+form.id+' input[type="checkbox"]').is(':checked')){
		html += '<img src="'+staticLink(form)+'" style="max-width=600px;"><br>'
	}
	html += 'Checklist Imported from <a href=\"http://www.ornitho.ch/\">ornitho.ch</a> with <a href=\"http://zoziologie.raphaelnussbaumer.com/biolovision2ebird/\">biolovision2eBird</a>';
	jQuery('#f-'+form.id+' #comments-preview').html(html);
};

function urleBird(layer){
	return 'http://ebird.org/ws1.1/ref/hotspot/geo?\
	lng='+layer.getBounds().getCenter().lng+'&\
	lat='+layer.getBounds().getCenter().lat+'&\
	dist='+Math.round(layer.getBounds().getNorthEast().distanceTo(layer.getBounds().getSouthWest())/2000).toString()+'&fmt=xml';
}

function Makemarker(s){

	var title = s.observers.observer.count+' '+s.species.name;
	var description = '<b>Date:</b> '+s.observers.observer.timing['#text'] + '<br>\
	<b>Specie:</b> '+s.species.name +'(<i>'+s.species.latin_name+'</i>)<br>'+'\
	<b>Place:</b> '+s.place.name+' / '+s.place.municipality+' ('+s.place.county+') - '+s.place.altitude+'m<br>\
	<b>Observation:</b> '+ s.observers.observer.estimation_code + s.observers.observer.count + ' ind.<br>\
	<b>ID</b>: <a href="http://www.'+ jQuery('#sel-website').val() +'/index.php?m_id=54&id='+s.observers.observer.id_sighting+'">'+s.observers.observer.id_sighting+'</a>';
	if (s.observers.observer.medias){
		if (!Array.isArray(s.observers.observer.medias.media)){
			s.observers.observer.medias.media= [s.observers.observer.medias.media];
		}
		s.observers.observer.medias.media.forEach(function(m){
			var link = m.path+'/'+m.filename;
			description += '<br><a href="'+link+'"><img src="'+link+'"></a>'
		})
	}

	var mark = L.marker([s.observers.observer.coord_lat,s.observers.observer.coord_lon],{
		title: title,
		alt: title,
		icon: L.MakiMarkers.icon({
			icon: s['marker-symbol'],
			color: s['marker-color'],
			size: s['marker-size']
		})
	}).bindPopup(description)
	var feature = mark.feature = mark.feature || {};
	feature.type = "Feature";
	feature.properties = feature.properties || {};
	feature.properties['date'] = s.observers.observer.timing['#text'];
	feature.properties['specie'] = s.species.name;
	feature.properties['place'] = s.place.name+' / '+s.place.municipality+' ('+s.place.county+') - '+s.place.altitude+'m';
	feature.properties['observer'] = s.observers.observer.name;
	feature.properties['count'] = s.observers.observer.count;
	feature.properties['comment'] = '';
	feature.properties['img'] = '';//s.observers.observer.medias.media.path;
	feature.properties['id'] = s.observers.observer.id_sighting;
	feature.properties['marker-color'] = s['marker-color'];
	feature.properties['marker-size'] = s['marker-size'];
	feature.properties['marker-symbol'] = s['marker-symbol'];
	feature.properties['description'] = description;
	return mark
}

function ExportGeojson(){
	var downloadLink = document.createElement("a");
	var blob = new Blob([JSON.stringify(geojsonLayer.toGeoJSON(), null, 2)], {type: "application/json"});
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = d.DATE_YEAR+d.DATE_MONTH+d.DATE_DAY+'_'+d.PLACE.replace(/\ /g,'_')+".geojson";
	downloadLink.click();
}

function staticLink(form){
	var fs = form['layer'].toGeoJSON().features;
	var sl = "https://api.mapbox.com/v4/mapbox.streets/"
	fs.forEach(function(f,id){
		if (f.geometry.type==="Point") {
			sl += "pin-"+f.properties['marker-size']+"-"+f.properties['marker-symbol']+"+"+f.properties['marker-color']+"("+f.geometry.coordinates[0]+","+f.geometry.coordinates[1]+"),"
		} else if (f.geometry.type==="LineString") {
			coord = f.geometry.coordinates;
			coord.forEach(function(val2, id2){
				coord[id2][1] = fs[id].geometry.coordinates[id2][0]
				coord[id2][0] = fs[id].geometry.coordinates[id2][1]
			})
			sl += "path("+encodeURIComponent(L.PolylineUtil.encode(coord , 5))+"),"
		}
	})
	sl = sl.substring(0, sl.length - 1);
	sl += "/"+form['layer'].getBounds().getCenter().lng + ","
	sl += form['layer'].getBounds().getCenter().lat + ","
	sl += form['map'].getZoom() + "/"
	sl += "800x450@2x.png"
	sl += "?access_token=" + L.MakiMarkers.accessToken
	return sl
}

function ExportCSV(){
	/*
	var table=[];
	data.forms.form.forEach(f) {
		form.sightings.sighting.forEach(s){
			var eBird_bird = jQuery.grep(eBird_birds_list, function(e){ return e.id == s['@id']; })
			var row = {	commonname: eBird_bird,
				genus:'',
				specie:'',
				count:s.observers.observer.count,
				spcomment:'',
				location:f.name,
				lat:f.lat,
				lng:f.lon,
				date:moment(f.date).format('MM/DD/YYYY'),
				starttime:moment(f.date).format('HH:mm')
				state:s.place.county,
				country:s.place.country,
				protocol:f.,
				nbobserver:f.observers.n,
				duration:f.duration,
				allobservation: parseInt(f.full_form) ? 'Y' : 'N',
				effortdistance:f.distance,
				effortarea:'',
				submissioncomment:f.comment,
			};
			table.push(row)
		}
	}
	*/

	return eBird_bird[0].PRIMARY_COM_NAME

	// Creat the function returning the text 
	code_list=[];
	jQuery.each(matchCode, function(idx,code){
		eval('code_list.push(function code(d){\n'+code.doc.getValue()+'\n})')
		//csv_content = csv_content+ code() +',';
	})

	//Create the resulting structure
	var s=1; //success
	jQuery.each(data, function(id,d) {
		table[id]={};
		jQuery.each(code_list, function(idx,code){
			table[id][eBird_label[idx]] = code(d);
		})
		// Add "" for being export in CSV correctly... 
		table[id]['Species Comments'] = table[id]['Species Comments'].replace(/\"/g,'""');
		table[id]['Submission Comments'] = table[id]['Submission Comments'].replace(/\"/g,'""');

		// Check for required input
		console.log(table[id])
		if (table[id]['Common Name']==''){alert('Common Name cannot be empty!');s=0;return false};
		if (table[id]['Location Name']==''){alert('Location Name cannot be empty!');s=0;return false};
		if (table[id]['Date']==''){alert('Date cannot be empty!');s=0;return false};
		if (table[id]['Protocol']=='traveling' && table[id]['Number of Observers']==''){alert('With traveling protocal, Number of Observers must be set!');s=0;return false};
		if (table[id]['Protocol']=='traveling' && table[id]['Effort Distance Miles']==''){alert('With traveling protocal, Effort Distance Miles must be set!');s=0;return false;};
	});

	// Check for duplicate
	for (i=table.length-1;i>=0;i--){
		for (j=table.length-1;j>i;j--){
			if (table[j]['Common Name']==table[i]['Common Name'] && table[j]['Location Name']==table[i]['Location Name'] && table[j]['Date']==table[i]['Date']){
				//add j to i
				table[i]['Species Comments']+='<br><br>'+table[j]['Species Comments'];
				table[i]['Number']=(parseInt(table[i]['Number'])+parseInt(table[j]['Number'])).toString();

				// Remove the element
				table.splice(j,1);
			}
		}
	}
	

	// write the file
	if (!s) return;
	csv_content = ConvertToCSV(JSON.stringify(table));

	// create and open file and link
	var downloadLink = document.createElement("a");
	var blob = new Blob(["\ufeff", csv_content]);
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = table[0]['Date']+'_'+table[0]['Location Name'].replace(/\ /g,'_')+".csv";
	document.body.appendChild(downloadLink);
	downloadLink.click();
	document.body.removeChild(downloadLink);
}




function handleFile(file){
	if (file.name.split('.').pop().toLowerCase() === 'xml'){
		reader = new FileReader();
		reader.readAsText(file);//,'ISO-8859-15');
		reader.onload = function(){
			var xml = xml2json(jQuery.parseXML(reader.result)).replace('undefined','')
			data = jQuery.parseJSON(xml).data
			if (data.forms || data.sightings){
				ProcessSightings(data)
				jQuery('#c1').hide("slow",function(){
					jQuery('#c2').show("slow");	
				});
			} else{
				alert('Empty File. Try again!')
			}
		}
	} else {
		alert('Wrong file type. Need to be xml. Try again!')
	}
}


function ProcessSightings(data) {
	if( data.sightings ) {
		jQuery('#modal-sigthings').modal('show');

		// Initiate map
		modalmap = L.map('modal-map');
		L.tileLayer.provider('MapBox', {id: 'rafnuss.npl3amec', accessToken:L.MakiMarkers.accessToken}).addTo(modalmap)
		modalfLayer = new L.FeatureGroup().addTo(modalmap);
		new L.Control.Draw({
			position: 'topright',
			draw: {
				polyline: false,
				polygon: false,
				circle: false,
				rectangle: true, 
				marker: {
					icon: L.AwesomeMarkers.icon({
						icon: 'list',
					})
				}
			},
			edit: {
				featureGroup: modalfLayer
			}
		}).addTo(modalmap)
		modalmap.on('draw:created', function (e) {
			if (e.layerType === 'marker'){
				if (typeof data.forms == 'undefined'){
					data.forms={};
				}
				if (typeof data.forms.form == 'undefined'){
					data.forms.form=[];
				}
				data.forms.n +=1;
				var form = {
					id: data.forms.n,
					color:marker_color[data.forms.n],
					lat: e.target.getCenter().lat,
					lon:e.target.getCenter().lng,
					name:'New List ' + data.forms.form.length.toString(),
					sightings: {sighting:[]}
				}
				data.forms.form.push(form)
				// update marker
				e.layer.setIcon(L.AwesomeMarkers.icon({
					icon: 'list',
					markerColor: form.color[0]
				})).bindPopup(form.name).addTo(modalfLayer);
				e.layer.id = form.id;
			} else if (e.layerType === 'rectangle'){
				modalsLayer.eachLayer(function(l){
					if (e.layer.getBounds().contains(l.getLatLng())){
						l.fireEvent('click');
					}
				})
			}
		}).on('draw:deleted', function(e){
			e.layers.eachLayer(function(l){
				data.forms.form.forEach(function(f,idx){
					if (f.id == l.id){
						data.forms.form.splice(idx,1);
					}
				})
			})
		});
		jQuery('#modal-sigthings').on('shown.bs.modal', function(){
			setTimeout(function() {
				modalmap.invalidateSize();
				modalmap.fitBounds(modalsLayer.getBounds());
			}, 1);
		}).on('hidden.bs.modal', function(){
			data.sightings.sighting.forEach(function(s){
				data.forms.form.forEach(function(f){
					if (s['marker-color'] == f.color[1]){
						f.sightings.sighting.push(s);
					}
				})
			})
			ProcessForms(data)
		});


		// Import Form
		if (data.forms) {
			data.forms.form.forEach(function(form,idx){
				form['color'] = marker_color[idx];
				form.name=form.sightings.sighting[0].place.name;
				form.id=idx;
				var m = L.marker([form.lat,form.lon],{
					title: form.name,
					alt: form.name,
					icon: L.AwesomeMarkers.icon({
						icon: 'list',
						markerColor: form['color'][0]
					})
				})
				m.id=idx;
				m.addTo(modalfLayer).bindPopup(form.name);
			});
			data.forms.n=data.forms.form.length-1;
		}

		// Import Sigthings
		modalsLayer = L.markerClusterGroup({
			showCoverageOnHover: false,
			maxClusterRadius:70,
		}).addTo(modalmap);
		if (!Array.isArray(data.sightings.sighting)){
			data.sightings.sighting = [data.sightings.sighting]
		}

		data.sightings.sighting.forEach(function(s){
			s['marker-symbol'] = Math.min(s.observers.observer.count,99);
			s['marker-color'] ='#fff';
			s['marker-size'] = 's';
			var m = Makemarker(s);
			m.form = 0;
			m.on('click', function(e) {
				if (data.forms) {
					if (e.target.form > data.forms.form.length-1){
						e.target.form = 0;
						s['marker-color'] = '#fff'
					} else {
						e.target.form += 1;
						s['marker-color'] = data.forms.form[e.target.form-1].color[1];
					}
					e.target.setIcon(Makemarker(s).options.icon)
				} else {
					alert('You first need to create a list')
				}
			}).addTo(modalsLayer);
		})
	}
};

// Define behavor of the dragFunction when file uploaded
function ProcessForms(data) {
	if (data.forms) {
		data.forms.form.forEach(function(form,idx,forms){
			if (form.sightings.sighting.lengh<1) {
				forms.splice(idx, 1);
			} else {
				form.date = moment(form.sightings.sighting[0].date['@ISO8601']).format('YYYY-MM-DD')+'T'+moment(form.time_start,"HH:mm").format('HH:mm')
				var duration = moment.utc(moment(form.time_stop,"HH:mm").diff(moment(form.time_start,"HH:mm"))).format('HH:mm')
				form.duration = parseInt(duration.split(':')[0])*60+parseInt(duration.split(':')[1])
			}
		})
		data.forms.form.forEach(function(form,idx){
			jQuery( "#c2 .nav-tabs" ).append( "<li class='active' id='li-f-"+form.id+"'><a href='#f-"+form.id+"' data-toggle='tab'>"+form.name+"</a>" );
			jQuery( "#c2 .tab-content" ).append( "<div class='tab-pane active' id='f-"+form.id+"'></div>" );

			jQuery( "#f-" + form.id ).append( '\
				<form class="form-horizontal">\
				<div class="form-group">\
				<label class="control-label col-sm-2" for="location">Location:</label>\
				<div class="col-sm-10">\
				<input type="text" class="form-control" id="location" value="'+form.name+'">\
				</div>\
				</div>\
				<div class="form-group">\
				<label class="control-label col-sm-2" for="date">Date:</label>\
				<div class="col-sm-10"> \
				<input type="datetime-local" class="form-control" id="date" value="'+form.date+'"></div>\
				</div>\
				</div>\
				<div class="form-group">\
				<label class="control-label col-sm-2" for="observation-type">Observation Type:</label>\
				<div class="col-sm-10">\
				<select class="form-control" id="observation-type">\
				<option>Traveling</option>\
				<option selected="selected">Stationary</option>\
				<option>Historical</option>\
				<option>Incidental</option>\
				</select>\
				</div>\
				</div>\
				<div class="form-group">\
				<label class="control-label col-sm-2" for="duration">Duration ( min.):</label> \
				<div class="col-sm-10"> \
				<input type="number" class="form-control" id="duration" value="'+form.duration.toString()+'">\
				</div>\
				</div>\
				<div class="form-group">\
				<label class="control-label col-sm-2" for="distance">Distance (km):</label>\
				<div class="col-sm-10"> \
				<input type="number" class="form-control" id="distance" value="0">\
				</div>\
				</div>\
				<div class="form-group">\
				<label class="control-label col-sm-2" for="party-size">Party size:</label>\
				<div class="col-sm-10"> \
				<input type="number" class="form-control" id="party-size" value="1">\
				</div>\
				</div>\
				<div class="form-group">\
				<div class="col-sm-2">\
				<label class="control-label" for="comments">Comments:</label>\
				<div class="checkbox">\
				<label style="text-align: right;">Static map<input type="checkbox" checked="checked"style="right:72px;"></label>\
				</div>\
				</div>\
				<div class="col-sm-10"> \
				<textarea class="form-control" rows="3"  id="comments">'+(form.comment || "") +'<br></textarea>\
				</div>\
				</div>\
				<div class="form-group">\
				<label class="control-label col-sm-2">Preview:</label>\
				<div class="col-sm-10"> \
				<div id="comments-preview"></div>\
				</div>\
				</div>\
				<div class="form-group">\
				<div class="map" id="map-f-'+form.id+'"></div>\
				</div>\
				<div class="form-group"> \
				<div class="col-sm-12 text-center">\
				<button type="submit" class="btn btn-default">Preview</button>\
				</div>\
				</div>\
				</form>\
				');

			form['map'] = L.map('map-f-'+form.id);
			L.control.layers({
				'MapBox': L.tileLayer.provider('MapBox', {id: 'rafnuss.npl3amec', accessToken:L.MakiMarkers.accessToken}),
				'OpenStreetMap' : L.tileLayer.provider('OpenStreetMap.Mapnik'),
				'Swisstopo': new L.TileLayer('https://wmts10.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg', {
					layer: 'ch.swisstopo.pixelkarte-farbe-pk1000.noscale',
					maxZoom: 17,
					attribution: 'Map data &copy; 2015 swisstopo',
				}).addTo(form['map'])
			},null,{collapsed:true}).addTo(form['map']);
			form['layer'] = L.markerClusterGroup({
				showCoverageOnHover: false,
				maxClusterRadius:70,
			}).addTo(form['map']);
			new L.Control.Draw({
				position: 'topleft',
				draw: {
					polyline: { 
						shapeOptions: {
							color: '#000',
							weight: 2,
							opacity :1
						}
					},
					polygon: false,
					circle: false,
					rectangle: false, 
					marker: {
						icon: L.MakiMarkers.icon({
							icon: 'circle', 
							color: '#000', 
							size: "l"
						})
					}
				},
				edit: {
					featureGroup: form['layer'],
				}
			}).addTo(form['map'])
			form['map'].on('draw:created', function (e) {
				e.layer.addTo(form['layer']);
				if (e.layerType === 'polyline'){
    				// Calculating the distance of the polyline
    				var tempLatLng = null;
    				var totalDistance = 0.00000;
    				jQuery.each(e.layer._latlngs, function(i, latlng){
    					if(tempLatLng == null){
    						tempLatLng = latlng;
    						return;
    					}
    					totalDistance += tempLatLng.distanceTo(latlng);
    					tempLatLng = latlng;
    				});
    				var km = (totalDistance/1000).toFixed(2);
    				e.layer.bindPopup( '<button class="btn btn-default" onclick="setDist('+form.id+','+km+');">Set Distance to: '+km+'km</button>');
    				e.layer.openPopup();
    			}
    			form['map'].fitBounds(form['layer'].getBounds());
    			updatePreview(form)
    		});

			form.sightings.sighting.forEach(function(s) {
				if(s.observers.observer.estimation_code=='MINIMUM') {
					s.observers.observer.estimation_code='>';
				} else if (s.observers.observer.estimation_code=='EXACT_VALUE') {
					s.observers.observer.estimation_code='=';
				} else if (s.observers.observer.estimation_code=='APPROXIMATION') {
					s.observers.observer.estimation_code='~';
				} else if (s.observers.observer.estimation_code=='NO_VALUE') {
					s.observers.observer.estimation_code='x'
				}

				s['marker-symbol'] = Math.min(s.observers.observer.count,99);
				s['marker-color'] = color(s,form);
				s['marker-size'] = 'm';
				var m = Makemarker(s);
				m.addTo(form['layer']);
			});

			//update the map
			form['map'].fitBounds(form['layer'].getBounds());	

			// Load local hotspot
			form['layer-hotspot']=L.layerGroup().addTo(form['map'])
			jQuery.get( urleBird(form['layer']), function( xml ) {
				var json = jQuery.parseJSON(xml2json(xml).replace('undefined',''))
				if (json.response.result){
					var hotspots=json.response.result.location;
					if (!Array.isArray(hotspots)){ 
						hotspots = [hotspots] 
					}
					hotspots.forEach(function(h){
						var mark = L.marker([h.lat,h.lng],{
							title: h['loc-name'],
							alt: h['loc-name'],
							icon: L.icon({
								iconUrl: "http://ebird.org/content/eBirdCommon/images/google/markers/eb_marker_hotspot_2.png",
								iconAnchor: [15, 19],
								popupAnchor: [0, -19],
							})
						})
						mark.addTo(form['layer-hotspot']).bindPopup('\
							<a href="http://ebird.org/ebird/hotspot/'+h['loc-id']+'" target="_blank" title="See on eBird"><h3>'+h['loc-name']+'</3></a><br>\
							<button class="btn btn-default" onclick="setLoc('+form.id+',\''+h['loc-name']+'\');" title="Define as location of the checklist">Set Location</button>');
					})
				}
			});
			// Update the comment preview
			jQuery('#f-'+form.id+' #comments').change( function(){updatePreview(form)} );
			jQuery('#f-'+form.id+' input[type="checkbox"]').change( function(){updatePreview(form)});
			jQuery('#f-'+form.id+' #location').keyup( function(){ 
				setLoc(form.id, jQuery(this).val() ) 
			});
			updatePreview(form)
		})
}
	// Activate only the first tab
	jQuery('.tab-content .tab-pane').each( function(idx,item){
		var id = jQuery(item).attr('id');
		if (idx==0){
			jQuery('#'+id).addClass('active')
			jQuery('#li-'+id).addClass('active')
		} else {
			jQuery('#'+id).removeClass('active')
			jQuery('#li-'+id).removeClass('active')
		}
	})
}





jQuery(document).ready(function(){  

	/* c1: Download biolovision data*/  
	//Define daptepicker
	jQuery('#input-date-from').datetimepicker({
		format: 'DD.MM.YYYY',
		showTodayButton:true,
	})
	jQuery('#input-date-to').datetimepicker({
		format: 'DD.MM.YYYY',
		showTodayButton:true,
	})
	// Button to download data
	jQuery('#link-id').click( function(){
		if (jQuery('input[type=radio][value=offset]').prop("checked")){
			var DChoice='offset';
		} else {
			var DChoice='range';
		}
		window.open("http://www."+jQuery('#sel-website').val()+"/index.php?m_id=97&sp_DChoice=" + DChoice + "&sp_DFrom="+jQuery('#input-date-from').val()+"&sp_DTo="+jQuery('#input-date-to').val()+"&sp_DOffset="+ jQuery('#date_ago').val() +"&sp_SChoice=all&sp_PChoice=all&sp_OnlyMyData=1&sp_FChoice=export&sp_FExportFormat=XML")
	});



	/* c2: Upload file*/ 
	// Drag and drop
	dropbox = document.getElementById("dropbox");
	dropbox.addEventListener("dragenter", function(e){
		e.stopPropagation();
		e.preventDefault();
	}, false);
	dropbox.addEventListener("dragover", function(e){
		e.stopPropagation();
		e.preventDefault();
	}, false);
	dropbox.addEventListener("drop", function(e){
		e.stopPropagation();
		e.preventDefault();
		handleFile(e.dataTransfer.files[0])
	}, false);
	dropbox.addEventListener("click", function(){
		jQuery("#upload").click();
	})
	document.getElementById('upload').onchange = function(e){
		handleFile(e.target.files[0])
	}

	/* c3: Result*/

	// Button to write to file
	jQuery('#button-download-biolovision').click( ExportCSV );

	// Create the Code section
	jQuery.getJSON( "http://zoziologie.raphaelnussbaumer.com/wp-content/plugins/biolovision2eBird/match.json", function( match ) {
		matchCode=[];
		jQuery.each(match, function(idx,m){
			eBird_label.push(m.label);
			jQuery('#matching').append('<div class="col-md-12 form-group"><b data-toggle="tooltip" title="'+m.tooltip+'">'+m.label+'</b><div id="'+m.id+'"></div></div>');
			var code = CodeMirror(document.getElementById(m.id), {
				value: m.code,
				mode:  "javascript",
				//theme: "3024-day",
				lineNumbers: true,
				lineWrapping: true,
			})
			matchCode.push(code);
		});
	});

	// Map
	L.MakiMarkers.accessToken = '';


});
