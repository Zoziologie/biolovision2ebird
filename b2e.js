
// Load conversion taxonomie biolovision - eBird
var eBird_birds_list;
jQuery.getJSON("http://zoziologie.raphaelnussbaumer.com/wp-content/plugins/biolovision2eBird/patch_ornitho2eBird.json", function(data){
	eBird_birds_list = data;
});

// Variable to put in workspace
var data, meta, csv_content, d, matchCode, reader, code_list=[],eBird_label=[],table=[],modalmap,modalsLayer, modalfLayer;

var marker_color = [['red','#D63E2A','white'], ['orange','#f69730','white'], ['green','#72B026','white'], ['blue','#38A9DC','white'], ['purple','#CD50B5','white'], ['darkred','#A23336','white'], ['darkgreen','728224','white'], ['darkpuple','#593869','white'], ['cadetblue','#436877','white'], ['red','#D63E2A','black'], ['orange','#f69730','black'], ['green','#72B026','black'], ['blue','#38A9DC','black'], ['purple','#CD50B5','black'], ['darkred','#A23336','black'], ['darkgreen','728224','black'], ['darkpuple','#593869','black'], ['cadetblue','#436877','black']];

function color(s,form){
	color_gradient = ['#fff','#352A87', '#363093', '#3637A0', '#353DAD', '#3243BA', '#2C4AC7', '#2053D4', '#0F5CDD', '#0363E1', '#0268E1', '#046DE0', '#0871DE', '#0D75DC', '#1079DA', '#127DD8', '#1481D6', '#1485D4', '#1389D3', '#108ED2', '#0C93D2', '#0998D1', '#079CCF', '#06A0CD', '#06A4CA', '#06A7C6', '#07A9C2', '#0AACBE', '#0FAEB9', '#15B1B4', '#1DB3AF', '#25B5A9', '#2EB7A4', '#38B99E', '#42BB98', '#4DBC92', '#59BD8C', '#65BE86', '#71BF80', '#7CBF7B', '#87BF77', '#92BF73', '#9CBF6F', '#A5BE6B', '#AEBE67', '#B7BD64', '#C0BC60', '#C8BC5D', '#D1BB59', '#D9BA56', '#E1B952', '#E9B94E', '#F1B94A', '#F8BB44', '#FDBE3D', '#FFC337', '#FEC832', '#FCCE2E', '#FAD32A', '#F7D826', '#F5DE21', '#F5E41D', '#F5EB18', '#F6F313', '#F9FB0E'];
	var t = moment(s.observers.observer.timing["@ISO8601"]).hour()*60+moment(s.observers.observer.timing["@ISO8601"]).minute();
	var start = moment(form.date).hour()*60+moment(form.date).minute();
	var r = Math.round(  (t - start )/form.duration * (color_gradient.length-1) )+1;
	r= (r<0) ? 0 : r;
	r= (r>=color_gradient.length) ? color_gradient.length-1 : r;
	return color_gradient[r].split('#')[1]
}


function previewComment(form){
	var html = jQuery('#f-'+form.id+' #comments').val() +'<br>';
	if (jQuery('#f-'+form.id+' #check-static-map').is(':checked')){
		html += '<img src="'+staticLink(form)+'" style="max-width:600px;width:100%"><br>'
		form.zoomSlider.enable()
		form.layer.msm.addTo(form.map);
		jQuery('#center-map').removeClass('disabled')
	} else {
		form.zoomSlider.disable()
		form.layer.msm.removeFrom(form.map);
		jQuery('#center-map').addClass('disabled')
	}
	html += 'Checklist Imported from <a href=\"http://www.ornitho.ch/\">ornitho.ch</a> with <a href=\"http://zoziologie.raphaelnussbaumer.com/biolovision2ebird/\">biolovision2eBird</a>';
	jQuery('#f-'+form.id+' #comments-preview').html(html);
	form.comment=html;
};

function SpComment(form,s){
	var cmt = jQuery("<div></div>").append(jQuery('#cmt-sp-ct-bt-'+ form.id).html());
	jQuery(cmt).find('span').each(function(){
		jQuery(this).replaceWith(eval(jQuery(this).attr('value')));
	})
	return cmt.text().replace(/	/g,'')
}

function staticLink(form){
	var fs = form.layer.edit.toGeoJSON().features.concat(form.layer.sightings.toGeoJSON().features);
	var sl = "https://api.mapbox.com/v4/mapbox.streets/"
	fs.forEach(function(f){
		if (f.geometry.type==="Point") {
			sl += "pin-"+f.properties['marker-size']+"-"+f.properties['marker-symbol']+"+"+f.properties['marker-color']+"("+f.geometry.coordinates[0]+","+f.geometry.coordinates[1]+"),"
		} else if (f.geometry.type==="LineString") {
			var coord = f.geometry.coordinates.slice();
			coord.forEach(function(c,id){
				var a = c[0];
				c[0] = c[1];
				c[1] =a;
			})
			sl += "path("+encodeURIComponent(L.PolylineUtil.encode(coord , 5))+"),"
		}
	})
	sl = sl.substring(0, sl.length - 1);
	
	sl += "/"+form.staticmap.lng + ","
	sl += form.staticmap.lat + ","
	sl +=  form.staticmap.zoom + "/"
	sl += "800x450@2x.png"
	sl += "?access_token=" + L.MakiMarkers.accessToken
	return sl
}

function previewSpComment(form){
	s=form.sightings.sighting[jQuery('#f-'+form.id+' #cmt-sp-preview-sp').val()]
	cmt = SpComment(form,s)
	jQuery('#f-'+form.id+' #cmt-sp-preview').html(cmt)
}

function urleBird(LatLngBounds){
	return 'http://ebird.org/ws1.1/ref/hotspot/geo?\
	lng='+LatLngBounds.getCenter().lng+'&\
	lat='+LatLngBounds.getCenter().lat+'&\
	dist='+Math.round(LatLngBounds.getNorthEast().distanceTo(LatLngBounds.getSouthWest())/500).toString()+'&fmt=xml';
}

function ExportGeojson(){
	var downloadLink = document.createElement("a");
	var blob = new Blob([JSON.stringify(geojsonLayer.toGeoJSON(), null, 2)], {type: "application/json"});
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = d.DATE_YEAR+d.DATE_MONTH+d.DATE_DAY+'_'+d.PLACE.replace(/\ /g,'_')+".geojson";
	downloadLink.click();
}

function getBoundsZoomLevel(bounds, mapDim) {
	var WORLD_DIM = { height: 256, width: 256 };
	var ZOOM_MAX = 21;

	function latRad(lat) {
		var sin = Math.sin(lat * Math.PI / 180);
		var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
		return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
	}

	function zoom(mapPx, worldPx, fraction) {
		return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
	}

	var ne = bounds.getNorthEast();
	var sw = bounds.getSouthWest();

	var latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI;

	var lngDiff = ne.lng - sw.lng;
	var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

	var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
	var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

	return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

function Makemarker(s){
	var title = s.observers.observer.count+' '+s.species.name;
	var description = '<b>Date:</b> '+s.observers.observer.timing['#text'] + '<br>\
	<b>Specie:</b> '+s.species.name +'(<i>'+s.species.latin_name+'</i>)<br>'+'\
	<b>Place:</b> '+s.place.name+' / '+s.place.municipality+' ('+s.place.county+') - '+s.place.altitude+'m<br>\
	<b>Observation:</b> '+ s.observers.observer.estimation_code + s.observers.observer.count + ' ind.<br>\
	<b>ID</b>: <a href="http://www.'+ jQuery('#sel-website').val() +'/index.php?m_id=54&id='+s.observers.observer.id_sighting+'" target="_blank">'+s.observers.observer.id_sighting+'</a>';
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


//____________________________________________________
//                EXPORT FUNCTIONS
//____________________________________________________
function Form2Table(f){
	table=[]
	f.sightings.sighting.forEach( function(s) {
		var eBird_bird = jQuery.grep(eBird_birds_list, function(e){ return e.id == s.species['@id'] })

		var row = {
			common_name: eBird_bird[0].PRIMARY_COM_NAME,
			genus:'',
			specie:'',
			count: s.observers.observer.count,
			specie_comment:SpComment(f,s).replace(/"/g,'""'),
			location:f.name,
			lat:f.lat,
			lng:f.lon,
			date:moment(f.date).format('MM/DD/YYYY'),
			start_time:moment(f.date).format('HH:mm'),
			state:s.place.county,
			country: (s.place.country) ? s.place.country : 'CH',
			protocol: f.protocol,
			party_size: f['party-size'],
			duration:f.duration,
			full_form: f.full_form ? 'Y' : 'N',
			distance:f.distance,
			area:'',
			form_comment:f.comment.replace(/"/g,'""'),
		};
		if (row.common_name==''){alert('Common Name cannot be empty!');};
		if (row.location==''){alert('Location Name cannot be empty!');};
		if (row.date==''){alert('Date cannot be empty!');};
		if (row.protocol=='traveling' && row['Number of Observers']==''){alert('With traveling protocal, Number of Observers must be set!');};
		if (row.protocol=='traveling' && row['Effort Distance Miles']==''){alert('With traveling protocal, Effort Distance Miles must be set!');};
		table.push(row)
	})
	// Check for duplicate
	for (i=table.length-1;i>=0;i--){
		for (j=table.length-1;j>i;j--){
			if (table[j].common_name==table[i].common_name){
				//add j to i
				if (table[i].specie_comment && table[j].specie_comment){
					table[i].specie_comment+='<br><br>'+table[j].specie_comment;
				}
				table[i].count=(parseInt(table[i].count)+parseInt(table[j].count)).toString();
				table.splice(j,1);// Remove the element
			}
		}
	}
	return table;
}

function Table2CSV(table) {
	var str = '';
	for (var i = 0; i < table.length; i++) {
		var line = '';
		for (var index in table[i]) {
			if (line != '') line += ','
				line += '"'+table[i][index]+'"';
		}
		str += line + '\r\n';
	}
	return str;
}

function singleExport(form){
	var table = Form2Table(form);
	/*var html = '<div class="row"><table class="table table-condensed table-responsive"><thead><tr>';
	for (var header in table[0]) {
		if (table[0].hasOwnProperty(header)) {
			html += '<th>'+header+'</th>'
		}
	}
	html += '</tr></thead><tbody>';
	table.forEach(function(t){
		html += '<tr>'
		for (var header in t) {
			if (t.hasOwnProperty(header)) {
				html += '<td>'+t[header]+'</td>'
			}
		}
		html += '</tr>'
	})
	html += '</tbody></table></div>';
	jQuery( "#f-" + form.id ).append( html);
	*/
	csv = Table2CSV(table);
	// create and open file and link
	var downloadLink = document.createElement("a");
	var blob = new Blob(["\ufeff", csv]);
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = form.name.replace(/\ /g,'_')+".csv";
	document.body.appendChild(downloadLink);
	downloadLink.click();
	document.body.removeChild(downloadLink);
}

function Export(){
	var table=[];
	var filename ='';
	data.forms.form.forEach( function(f) {
		t = Form2Table(f);
		table = table.concat(t);
		filename += f.name + '_';
	})

	csv = Table2CSV(table);
	// create and open file and link
	var downloadLink = document.createElement("a");
	var blob = new Blob(["\ufeff", csv]);
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = filename.replace(/\ /g,'_')+".csv";
	document.body.appendChild(downloadLink);
	downloadLink.click();
	document.body.removeChild(downloadLink);
}



//____________________________________________________
//                CREATE FUNCTIONS
//____________________________________________________

function handleFile(file){
	if (file.name.split('.').pop().toLowerCase() === 'xml'){
		reader = new FileReader();
		reader.readAsText(file);//,'ISO-8859-15');
		reader.onload = function(){
			var xml = xml2json(jQuery.parseXML(reader.result)).replace('undefined','')
			data = jQuery.parseJSON(xml).data
			if (data.forms){
				InitiateForms(data)
			}
			if (data.sightings) {
				ProcessSightings(data)
				jQuery('#c1').hide("slow",function(){
					jQuery('#c2').show("slow");	
				});
			} else if (data.forms){
				jQuery('#c1').hide("slow",function(){
					jQuery('#c2').show("slow",function(){
						ProcessForms(data)
					});	
				});
			} else {
				alert('Empty File. Try again!')
				return
			}

		}
	} else {
		alert('Wrong file type. Need to be xml. Try again!')
	}
}

function InitiateForms(data){
	if (!Array.isArray(data.forms.form)){ 
		data.forms.form = [data.forms.form] 
	}
	data.forms.form.forEach(function(f,idx){
		f.color = marker_color[idx];
		f.id=idx;
		f.name=f.sightings.sighting[0].place.name;
		f.time_start = moment(f.time_start,"HH:mm").format("HH:mm") // 9:1 -> 09:01
	});
	data.forms.n=data.forms.form.length-1;
}

function ProcessSightings(data) {
	if (!Array.isArray(data.sightings.sighting)){ 
		data.sightings.sighting = [data.sightings.sighting] 
	}
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
			data.forms.n +=1;
			var form = {
				id: data.forms.n,
				color:marker_color[data.forms.n],
				name: 'New List ' + data.forms.form.length.toString(),
				sightings: {sighting:[]},
				marker: e.layer,
				full_form: false
			}
			data.forms.form.push(form)
			// update marker
			e.layer.setIcon(L.AwesomeMarkers.icon({
				icon: 'list',
				markerColor: form.color[0],
				iconColor: form.color[2]
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
	data.forms.form.forEach(function(f){
		var m = L.marker([f.lat, f.lon],{
			title: f.name,
			alt: f.name,
			icon: L.AwesomeMarkers.icon({
				icon: 'list',
				markerColor: f.color[0],
				iconColor: f.color[2]
			})
		})
		m.id=f.id;
		f.marker=m;
		m.addTo(modalfLayer).bindPopup(f.name);
	});

	// Import Sigthings
	modalsLayer = L.markerClusterGroup({
		showCoverageOnHover: false,
		maxClusterRadius:70,
	}).addTo(modalmap);
	if (!Array.isArray(data.sightings.sighting)){
		data.sightings.sighting = [data.sightings.sighting]
	}

	data.sightings.sighting.forEach(function(s){
		s['marker-symbol'] = (s.observers.observer.count < 99) ? s.observers.observer.count : 'x';
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
};


function ProcessForms(data) {
	// delete forms with empty sightings
	var i = data.forms.form.length
	while (i--) {
		if (!data.forms.form[i].sightings.sighting[0]) {
			data.forms.form.splice(i, 1);
		}
	}

	data.forms.form.forEach(function(form,idx){
		if ( form['@id']){
			var duration = moment.utc(moment(form.time_stop,"HH:mm").diff(moment(form.time_start,"HH:mm"))).format('HH:mm');
			form.duration = parseInt(duration.split(':')[0])*60+parseInt(duration.split(':')[1]);
			form.date = moment(form.sightings.sighting[0].date['@ISO8601']).format('YYYY-MM-DD')+'T'+form.time_start;
			form.full_form= (form.full_form=='1') ? true : false;
		} else {
			form.duration ='60';
			form.date = form.sightings.sighting[0].observers.observer.timing['@ISO8601'].split('+')[0];
		}
		form.distance=0;
		form.protocol='Stationary';
		form['party-size']='1';
		form.staticmap={};
		if (form.marker){
			form.lon=form.marker.getLatLng().lng;
			form.lat=form.marker.getLatLng().lat;
		}

		form.specie_comment="var c='';\
		c = c + o.estimation_code+o.count+' ind.';\
		if(!o.detail){c = c + ' - ' + o.detail;}\n\
		if(!o.timing['@ISO8601']){c = c+' - '+moment(o.timing['@ISO8601']).format('HH:mm');}\n\
		c = c+' - <a href=\"http://maps.google.com?q='+o.coord_lat+','+o.coord_lon+'&t=k\">'+ s.place.name +'</a>';\n\
		c = c + ' - <a href=\"http://www.ornitho.ch/index.php?m_id=54&id='+o['@id']+'\">ornitho.ch</a>';\n\
		return c";
		jQuery( "#c2 .nav-tabs" ).append( "<li class='active' id='li-f-"+form.id+"'><a href='#f-"+form.id+"' data-toggle='tab'>"+form.name+"</a>" );
		jQuery( "#c2 .tab-content" ).append( "<div class='tab-pane active' id='f-"+form.id+"'></div>" );

		jQuery( "#f-" + form.id ).append( '\
			<form class="form">\
			<div class="row">\
			<div class="col-lg-12">\
			<div class="form-group col-lg-4">\
			<label for="location">Location:</label>\
			<input type="text" class="form-control" id="location" value="'+form.name+'">\
			</div>\
			<div class="form-group col-lg-4">\
			<label for="date">Date:</label>\
			<input type="datetime-local" class="form-control" id="date" value="'+form.date+'">\
			</div>\
			<div class="form-group col-lg-4">\
			<label for="observation-type">Observation Type:</label>\
			<select class="form-control" id="observation-type">\
			<option>Traveling</option>\
			<option>Stationary</option>\
			<option>Historical</option>\
			<option>Incidental</option>\
			</select>\
			</div>\
			<div class="form-group col-lg-3">\
			<label class="control-label" for="duration">Duration ( min.):</label> \
			<input type="number" class="form-control" id="duration" value="'+form.duration+'">\
			</div>\
			<div class="form-group col-lg-3">\
			<label for="distance">Distance (km):</label>\
			<input type="number" class="form-control" id="distance" value="'+form.distance+'">\
			</div>\
			<div class="form-group col-lg-3">\
			<label for="party-size">Party size:</label>\
			<input type="number" class="form-control" id="party-size" value="'+form['party-size']+'">\
			</div>\
			<div class="form-group col-lg-3">\
			<label>Complete Checklit:</label>\
			<div class="checkbox">\
			<div class="col-lg-3 text-right">\
			NO\
			</div>\
			<div class="col-lg-6 text-center">\
			<label class="switch"><input type="checkbox" checked="checked" id="check-fullform"><div class="sliderOF round"></div></label>\
			</div>\
			<div class=" col-lg-3 text-left">\
			YES\
			</div>\
			</div>\
			</div>\
			</div>\
			</div>\
			<div class="row">\
			<div class="col-lg-12">\
			<div class="form-group col-lg-6">\
			<label for="cmt-sp-ct-bt-'+ form.id+'">Species Comment:</label>\
			<div id="cmt-sp">\
			<div class="cmt-sp-ct cmt-sp-ct-tp" id="cmt-sp-ct-tp-'+ form.id+'">\
			<span class="label label-default" contenteditable="false" value="s.observers.observer.timing.text">Timing (full)</span>\
			<span class="label label-default" contenteditable="false" value="moment(s.observers.observer.timing[\'@ISO8601\']).format(\'dd-MM-YYYY HH:mm\')">Timing (condensed)</span>\
			<span class="label label-default" contenteditable="false" value="moment(s.observers.observer.timing[\'@ISO8601\']).format(\'HH:mm\')">Time</span>\
			<span class="label label-default" contenteditable="false" value="s.observers.observer.id_sighting">ID sighting</span>\
			<span class="label label-default" contenteditable="false" value="s.observers.observer.estimation_code">Estimation code</span>\
			<span class="label label-default" contenteditable="false" value="s.observers.observer.count">Count</span>\
			<span class="label label-default" contenteditable="false" value="s.observers.observer.coord_lat">Latitude</span>\
			<span class="label label-default" contenteditable="false" value="s.observers.observer.coord_lon">Longitude</span>\
			</div>\
			<div class="cmt-sp-ct cmt-sp-ct-bt" id="cmt-sp-ct-bt-'+ form.id+'" contenteditable="true">\
			<span class="label label-default" contenteditable="false" value="s.observers.observer.estimation_code">Estimation code</span>\
			<span class="label label-default" contenteditable="false" value="s.observers.observer.count">Count</span> ind. - <span class="label label-default" contenteditable="false" value="moment(s.observers.observer.timing[\'@ISO8601\']).format(\'hh:mm\')">Time</span> - &lt;a href="http://maps.google.com?q=<span class="label label-default" contenteditable="false" value="s.observers.observer.coord_lat">Latitude</span>,<span class="label label-default" contenteditable="false" value="s.observers.observer.coord_lon">Longitude</span>&t=k" target="_blank" &gt;<span class="label label-default" contenteditable="false" value="s.observers.observer.coord_lat">Latitude</span>,<span class="label label-default" contenteditable="false" value="s.observers.observer.coord_lon">Longitude</span>&lt;/a&gt; - &lt;a href="http://www.ornitho.ch/index.php?m_id=54&id=<span class="label label-default" contenteditable="false" value="s.observers.observer.id_sighting">ID sighting</span>" target="_blank">ornitho.ch&lt;/a&gt;\
			</div>\
			</div>\
			<div>\
			<label>Exemple:</label>\
			<div class="form-group">\
			<select id="cmt-sp-preview-sp">\
			</select>\
			</div>\
			<div id="cmt-sp-preview"></div>\
			</div>\
			</div>\
			<div class="form-group col-lg-6">\
			<label for="comments">Checklist Comment:</label>\
			<textarea class="form-control" rows="3"  id="comments">'+(form.comment || "") +'</textarea>\
			<div class="checkbox">\
			<label><input type="checkbox" checked="checked" id="check-static-map"> Include static map</label>\
			</div>\
			<div class="row">\
			<div class="form-group col-lg-4">\
			<button type="button" class="btn btn-link .btn-xs" id="center-map" title="Set static map automaticaly with sightings location">Center map</button>\
			</div>\
			<div class="form-group col-lg-8">\
			Zoom:\
			<input id="zoomSlider" data-slider-id="zoomSlider" type="text" data-slider-min="0" data-slider-max="22" data-slider-step="1" data-slider-value="14"/>\
			</div>\
			</div>\
			<label>Preview:</label>\
			<div id="comments-preview"></div>\
			</div>\
			</div>\
			</div>\
			<div class="row">\
			<div class="form-group col-sm-12">\
			<div class="map" id="map-f-'+form.id+'"></div>\
			</div>\
			<div class="form-group col-sm-12"> \
			<div class="text-center">\
			<button type="button" class="btn btn-default" id="singleExport-'+form.id+'">Export only this checklist</button>\
			</div>\
			</div>\
			</div>\
			</form>\
			');

		// Create Map
		form.map = L.map('map-f-'+form.id);

		// Create Layers
		form.layer={};
		form.layer.hotspots=L.featureGroup().addTo(form.map)
		form.layer.sightings = L.markerClusterGroup({
			showCoverageOnHover: false,
			maxClusterRadius:70,
		}).addTo(form.map);
		form.layer.edit = new L.FeatureGroup().addTo(form.map);
		form.layer.all = L.featureGroup([form.layer.edit, form.layer.sightings, form.layer.hotspots])

		//Add control
		L.control.layers({
			'MapBox': L.tileLayer.provider('MapBox', {id: 'rafnuss.npl3amec', accessToken:L.MakiMarkers.accessToken}),
			'OpenStreetMap' : L.tileLayer.provider('OpenStreetMap.Mapnik'),
			'Swisstopo': new L.TileLayer('https://wmts10.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg', {
				layer: 'ch.swisstopo.pixelkarte-farbe-pk1000.noscale',
				maxZoom: 17,
				attribution: 'Map data &copy; 2015 swisstopo',
			}).addTo(form.map)
		},null,{collapsed:true}).addTo(form.map);
		new L.Control.Draw({
			position: 'topright',
			draw: {
				polyline: { 
					shapeOptions: {
						color: '#000',
						weight: 2,
						opacity: 1
					}
				},
				polygon: false,
				circle: false,
				rectangle: false, 
				marker: false
			},
			edit: {
				featureGroup: form.layer.edit,
			}
		}).addTo(form.map)

		// Add Listener
		form.map.on('draw:created', function (e) {
			e.layer.addTo(form.layer.edit);
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

			var popup = jQuery('<div/>') 
			popup.html('Set Distance to: <button type="button" class="btn btn-default" id="setDistance">'+(totalDistance/1000).toFixed(2).toString()+'</button> km');
			popup.on('click', '#setDistance', function() {
				form.distance = jQuery(this).html();
				form.protocol = 'Traveling';
				jQuery('#f-'+form.id+' #distance').val(form.distance)
				jQuery('#f-'+form.id+' #observation-type').val(form.protocol)
			});
			e.layer.bindPopup(popup[0]).openPopup();
			form.map.fitBounds(form.layer.all.getBounds());
			previewComment(form)
		});

		// Import Sightings
		form.sightings.sighting.forEach(function(s,id) {
			if(s.observers.observer.estimation_code=='MINIMUM') {
				s.observers.observer.estimation_code='>';
			} else if (s.observers.observer.estimation_code=='EXACT_VALUE') {
				s.observers.observer.estimation_code='=';
			} else if (s.observers.observer.estimation_code=='ESTIMATION') {
				s.observers.observer.estimation_code='~';
			} else if (s.observers.observer.estimation_code=='NO_VALUE') {
				s.observers.observer.estimation_code=''
				s.observers.observer.count='x'
			}

			s['marker-symbol'] = (s.observers.observer.count < 99) ? s.observers.observer.count : 'x';
			s['marker-color'] = color(s,form);
			s['marker-size'] = 'm';
			var m = Makemarker(s);
			m.addTo(form.layer.sightings);

			// when finish
			if (id === form.sightings.sighting.length-1){
				form.map.fitBounds(form.layer.all.getBounds());
				form.staticmap.lng = form.layer.sightings.getBounds().getCenter().lng;
				form.staticmap.lat = form.layer.sightings.getBounds().getCenter().lat;
				form.layer.msm = L.marker([form.staticmap.lat,form.staticmap.lng], {
					icon:L.icon({
						iconUrl: 'http://zoziologie.raphaelnussbaumer.com/wp-content/uploads/2016/12/Untitled.png',
						iconSize:     [60, 60],
						iconAnchor:   [30, 30], 
						popupAnchor:  [-30, 0]
					}),
					draggable:true,
					title:'Static Map center',
					alt:'Static Map center'
				}).on('dragend',function(evt){
					form.staticmap.lng = evt.target.getLatLng().lng;
					form.staticmap.lat = evt.target.getLatLng().lat;
					previewComment(form)
				}).addTo(form.map);
				form.staticmap.zoom = getBoundsZoomLevel(L.featureGroup([form.layer.edit, form.layer.sightings]).getBounds(), { height: 450, width: 800 })
			}
		})

		
		// Load local hotspot
		jQuery.get( urleBird( form.layer.all.getBounds() ), function( xml ) {
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
					var popup = jQuery('<div/>') 
					popup.html('\
						Set Location of the Checklist with the eBird hostpot:<br>\
						<button type="button" class="btn btn-default" id="setLocation" title="Define as location of the checklist">'+h['loc-name']+'</button><br>\
						<a href="http://ebird.org/ebird/hotspot/'+h['loc-id']+'" target="_blank" title="See on eBird">View on eBird</a>');
					popup.on('click', '#setLocation', function() {
						form.name = jQuery(this).html();
						jQuery('#f-'+form.id+' #location').val(form.name)
						jQuery('#li-f-'+form.id+' a').html(form.name)
						jQuery(this).html('Done!')
						//form.map.closePopup();
					});
					mark.addTo(form.layer.hotspots).bindPopup(popup[0]);
				})
			}
			form.map.fitBounds(form.layer.all.getBounds());
		});

		// Add Listener
		jQuery('#f-'+form.id+' #location').keyup( function(){ 
			setLoc(form.id, jQuery(this).val() ) 
		});
		jQuery('#f-'+form.id+' #date').change( function(){ 
			form.date = jQuery(this).val()
		});
		jQuery('#f-'+form.id+' #observation-type').change( function(){ 
			form['observation-type'] = jQuery(this).val();
		});
		jQuery('#f-'+form.id+' #duration').change( function(){ 
			form.duration = jQuery(this).val();
		});
		jQuery('#f-'+form.id+' #distance').change( function(){ 
			form.distance = jQuery(this).val();
		});
		jQuery('#f-'+form.id+' #observation-type').val(form.protocol)
		jQuery('#f-'+form.id+' #party-size').change( function(){ 
			form['party-size'] = jQuery(this).val();
		});
		jQuery('#f-'+form.id+' #check-fullform').change( function(){
			if (jQuery(this).is(':checked')){
				form.full_form = '1'
			} else{
				form.full_form = '0'
			}
		})
		if (form.full_form) {
			jQuery('#f-'+form.id+' #check-fullform').prop("checked")
		} else {
			jQuery('#f-'+form.id+' #check-fullform').prop("checked",false)
		}
		jQuery('#f-'+form.id+' #comments').keyup( function(){
			previewComment(form);
		});
		jQuery('#f-'+form.id+' #check-static-map').change( function(){
			previewComment(form);
		});
		dragula([document.getElementById('cmt-sp-ct-tp-'+ form.id), document.getElementById('cmt-sp-ct-bt-'+ form.id)], {
			copy: function (el, source) {
				return source === document.getElementById('cmt-sp-ct-tp-'+ form.id)
			},
			accepts: function (el, target) {
				return target !== document.getElementById('cmt-sp-ct-tp-'+ form.id)
			},
			removeOnSpill: true
		});
		form.sightings.sighting.forEach( function(s,id){
			jQuery('#f-'+form.id+' #cmt-sp-preview-sp').append(jQuery('<option>', {
				value: id,
				text: s.species.name
			}));
		})
		jQuery('#center-map').click(function(){
			form.staticmap.lng = form.layer.sightings.getBounds().getCenter().lng;
			form.staticmap.lat = form.layer.sightings.getBounds().getCenter().lat;
			form.staticmap.zoom = getBoundsZoomLevel(L.featureGroup([form.layer.edit, form.layer.sightings]).getBounds(), { height: 450, width: 800 })
			form.layer.msm.setLatLng(form.layer.sightings.getBounds().getCenter());

			previewComment(form)
		})
		form.zoomSlider = jQuery('#zoomSlider').slider({
			formatter: function(value) {
				return 'Current value: ' + value;
			}
		}).on('change', function(evt){
			form.staticmap.zoom = form.zoomSlider.getValue();
			previewComment(form);
		}).data('slider');
		document.getElementById('cmt-sp-ct-bt-'+ form.id).addEventListener("input", function(){
			previewSpComment(form)
		}, false);
		document.getElementById('cmt-sp-ct-bt-'+ form.id).addEventListener("DOMNodeInserted", function(){
			previewSpComment(form)
		}, false);
		document.getElementById('cmt-sp-ct-bt-'+ form.id).addEventListener("DOMNodeRemoved", function(){
			previewSpComment(form)
		}, false);
		document.getElementById('cmt-sp-ct-bt-'+ form.id).addEventListener("DOMCharacterDataModified", function(){
			previewSpComment(form)
		}, false);
		jQuery('#f-'+form.id+' #cmt-sp-preview-sp').change( function(){
			previewSpComment(form);
		});
		document.getElementById("singleExport-"+form.id).addEventListener("click", function(){
			singleExport(form);
		});

		// Initiate 
		previewSpComment(form);
		previewComment(form)
		form.map.invalidateSize();
	})

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
	jQuery('#button-download-biolovision').click( Export );

	// Map
	L.MakiMarkers.accessToken = '';


});
