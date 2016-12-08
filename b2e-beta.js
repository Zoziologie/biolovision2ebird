
// Load conversion taxonomie biolovision - eBird
var eBird_birds_list;
jQuery.getJSON("http://zoziologie.raphaelnussbaumer.com/wp-content/plugins/biolovision2eBird/patch_ornitho2eBird.json", function(data){
	eBird_birds_list = data;
});

// Variable to put in workspace
var data, meta, csv_content, d, matchCode, reader, code_list=[],eBird_label=[],table=[];


function color(s,form){
	color_gradient = ['#fff','#352A87', '#363093', '#3637A0', '#353DAD', '#3243BA', '#2C4AC7', '#2053D4', '#0F5CDD', '#0363E1', '#0268E1', '#046DE0', '#0871DE', '#0D75DC', '#1079DA', '#127DD8', '#1481D6', '#1485D4', '#1389D3', '#108ED2', '#0C93D2', '#0998D1', '#079CCF', '#06A0CD', '#06A4CA', '#06A7C6', '#07A9C2', '#0AACBE', '#0FAEB9', '#15B1B4', '#1DB3AF', '#25B5A9', '#2EB7A4', '#38B99E', '#42BB98', '#4DBC92', '#59BD8C', '#65BE86', '#71BF80', '#7CBF7B', '#87BF77', '#92BF73', '#9CBF6F', '#A5BE6B', '#AEBE67', '#B7BD64', '#C0BC60', '#C8BC5D', '#D1BB59', '#D9BA56', '#E1B952', '#E9B94E', '#F1B94A', '#F8BB44', '#FDBE3D', '#FFC337', '#FEC832', '#FCCE2E', '#FAD32A', '#F7D826', '#F5DE21', '#F5E41D', '#F5EB18', '#F6F313', '#F9FB0E'];
	var t = moment(s.observers.observer.timing["@ISO8601"]).hour()*60+moment(s.observers.observer.timing["@ISO8601"]).minute()
	var start = moment(form.time_start,"HH:mm").hour()*60+moment(form.time_start,"HH:mm").minute()
	var end = moment(form.time_stop,"HH:mm").hour()*60+moment(form.time_stop,"HH:mm").minute()
	var r = Math.round(  (t - start )/(end-start) * (color_gradient.length-1) )+1
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
	jQuery('#'+id+' #location').val(h)
}

function setDist(id,dist){
	jQuery('#'+id+' #distance').val(dist)
	jQuery('#observation-type-'+id).val('Traveling')
}

function updatePreview(form){
	var html = jQuery('#'+form['@id']+' #comments').val() +'<br>';
	if (jQuery('#'+form['@id']+' input[type="checkbox"]').is(':checked')){
		html += '<img src="'+staticLink(form)+'" style="max-width=600px;"><br>'
	}
	html += 'Checklist Imported from <a href=\"http://www.ornitho.ch/\">ornitho.ch</a> with <a href=\"http://zoziologie.raphaelnussbaumer.com/biolovision2ebird/\">biolovision2eBird</a>';
	jQuery('#'+form['@id']+' #comments-preview').html(html);
};


// Define behavor of the dragFunction when file uploaded
function ProcessFile(data) {
	// Create a tab for each forms
	data.forms.form.forEach(function(form){
		jQuery( "#c2 .nav-tabs" ).append( "<li class='active' id='li-"+form['@id']+"'><a href='#"+form['@id']+"' data-toggle='tab'>List: "+form['@id']+"</a>" );
		jQuery( "#c2 .tab-content" ).append( "<div class='tab-pane active' id='"+form['@id']+"'></div>" );
		
		jQuery( "#" + form['@id'] ).append( '\
			<form class="form-horizontal">\
			<div class="form-group">\
			<label class="control-label col-sm-2" for="location">Location:</label>\
			<div class="col-sm-10">\
			<input type="text" class="form-control" id="location" value="'+form.sightings.sighting[0].place.name+'">\
			</div>\
			</div>\
			<div class="form-group">\
			<label class="control-label col-sm-2" for="date">Date:</label>\
			<div class="col-sm-10"> \
			<input type="datetime-local" class="form-control" id="date" value="'+moment(form.sightings.sighting[0].date['@ISO8601']).format('YYYY-MM-DD')+'T'+moment(form.time_start,"HH:mm").format('HH:mm')+'"></div>\
			</div>\
			</div>\
			<div class="form-group">\
			<label class="control-label col-sm-2" for="observation-type-'+form['@id']+'">Observation Type:</label>\
			<div class="col-sm-10">\
			<select class="form-control" id="observation-type-'+form['@id']+'">\
			<option>Traveling</option>\
			<option selected="selected">Stationary</option>\
			<option>Historical</option>\
			<option>Incidental</option>\
			</select>\
			</div>\
			</div>\
			<div class="form-group">\
			<label class="control-label col-sm-2" for="duration">Duration (hrs. | min.):</label> \
			<div class="col-sm-5"> \
			<input type="number" class="form-control" id="duration-hh" value="'+moment.utc(moment(form.time_stop,"HH:mm").diff(moment(form.time_start,"HH:mm"))).hour()+'">\
			</div>\
			<div class="col-sm-5"> \
			<input type="number" class="form-control" id="duration-mm" value="'+moment.utc(moment(form.time_stop,"HH:mm").diff(moment(form.time_start,"HH:mm"))).minute()+'">\
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
			<div class="map" id="map-'+form['@id']+'"></div>\
			</div>\
			<div class="form-group"> \
			<div class="col-sm-12 text-center">\
			<button type="submit" class="btn btn-default">Preview</button>\
			</div>\
			</div>\
			</form>\
			');

		//Create map
		form['map'] = L.map('map-'+form['@id']);
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
			maxClusterRadius:50,
		}).addTo(form['map']);
		new L.Control.Draw({
			position: 'topright',
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
    			e.layer.bindPopup( '<a class="btn btn-default" onclick="setDist('+form['@id']+','+km+');">Set Distance to: '+km+'km</a>');
    			e.layer.openPopup();
    		}
    		form['map'].fitBounds(form['layer'].getBounds());
    		updatePreview(form)
    	});

		form.sightings.sighting.forEach(function(s) {
			if(s.observers.observer.estimation_code=='>') {
				s.observers.observer.estimation_code='>';
			} else if (s.observers.observer.estimation_code=='EXACT_VALUE') {
				s.observers.observer.estimation_code='=';
			} else if (s.observers.observer.estimation_code=='~') {
				s.observers.observer.estimation_code='~';
			} else if (s.observers.observer.estimation_code=='NO_VALUE') {
				s.observers.observer.estimation_code='x'
			}

			// MAP
			s.title = s.observers.observer.count+' '+s.species.name;
			s.description = '<b>Date:</b> '+s.observers.observer.timing['#text'] + '<br>\
			<b>Specie:</b> '+s.species.name +'(<i>'+s.species.latin_name+'</i>)<br>'+'\
			<b>Place:</b> '+s.place.name+' / '+s.place.municipality+' ('+s.place.county+') - '+s.place.altitude+'m<br>\
			<b>Observation:</b> '+ s.observers.observer.estimation_code + s.observers.observer.count + ' ind.<br>\
			<b>ID</b>: <a href="http://www.'+ jQuery('#sel-website').val() +'/index.php?m_id=54&id='+s.observers.observer.id_sighting+'">'+s.observers.observer.id_sighting+'</a>';
			if (s.observers.observer.medias){
				if (Array.isArray(s.observers.observer.medias.media)){
					s.observers.observer.medias.media.forEach(function(m){
						var link = m.path+'/'+m.filename;
						s.description += '<br><a href="'+link+'"><img src="'+link+'"></a>'
					})} else {
						var link = s.observers.observer.medias.media.path+'/'+s.observers.observer.medias.media.filename;
						s.description += '<br><a href="'+link+'"><img src="'+link+'"></a>'
					}

				}

				var mark = L.marker([s.observers.observer.coord_lat,s.observers.observer.coord_lon],{
					title: s.title,
					alt: s.title,
					icon: L.MakiMarkers.icon({
						icon: Math.min(s.observers.observer.count,99), 
						color: color(s,form), 
						size: "m"
					})
				})
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
			feature.properties['marker-color'] = color(s,form);
			feature.properties['marker-size'] = 'm';
			feature.properties['marker-symbol'] = Math.min(99,s.observers.observer.count);
			mark.addTo(form['layer']).bindPopup(s.description);
		});
		//update the map
		form['map'].fitBounds(form['layer'].getBounds());	

		// Load local hotspot
		var url = 'http://ebird.org/ws1.1/ref/hotspot/geo?\
		lng='+form['layer'].getBounds().getCenter().lng+'&\
		lat='+form['layer'].getBounds().getCenter().lat+'&\
		dist='+Math.round(form['layer'].getBounds().getNorthEast().distanceTo(form['layer'].getBounds().getSouthWest())/2000).toString()+'&fmt=xml';
		form['layer-hotspot']=L.layerGroup().addTo(form['map'])
		jQuery.get( url, function( xml ) {
			var json = jQuery.parseJSON(xml2json(xml).replace('undefined',''))
			console.log(json)
			var hotspots=json.response.result.location;
			if (!Array.isArray(hotspots)){
				hotspots = [hotspots]
			}
			hotspots.forEach(function(h){
				console.log(h)
				var mark = L.marker([h.lat,h.lng],{
					title: h['loc-name'],
					alt: h['loc-name'],
					icon: L.icon({
						iconUrl: "http://ebird.org/content/eBirdCommon/images/google/markers/eb_marker_hotspot_2.png",
					})
				})
				mark.addTo(form['layer-hotspot']).bindPopup('\
					<a href="http://ebird.org/ebird/hotspot/'+h['loc-id']+'">'+h['loc-name']+'</a><br>\
					<a class="btn btn-default" onclick="setLoc('+form['@id']+',\''+h['loc-name']+'\');">Set Location</a>');
			})
			
		});

		// Update the comment preview
		jQuery('#'+form['@id']+' #comments').change( function(){updatePreview(form)} );
		jQuery('#'+form['@id']+' input[type="checkbox"]').change( function(){updatePreview(form)} );
		updatePreview(form)

		// Remove all active
		jQuery('#'+form['@id']).removeClass('active')
		jQuery('#li-'+form['@id']).removeClass('active')
	})
	// Activate only the first tab
	jQuery('#'+data.forms.form[0]['@id']).addClass('active')
	jQuery('#li-'+data.forms.form[0]['@id']).addClass('active')
};


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
	sl += Math.max(12,form['map'].getZoom()) + "/"
	sl += "800x450@2x.png"
	sl += "?access_token=" + L.MakiMarkers.accessToken
	return sl
}

function ExportCSV(){
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
	if (!s) return;

	// write the file
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
		var dt = e.dataTransfer;
		var files = dt.files;

		reader = new FileReader();
		reader.readAsText(files[0]);//,'ISO-8859-15');
		reader.onload = function(){
			var xml = xml2json(jQuery.parseXML(reader.result)).replace('undefined','')
			data = jQuery.parseJSON(xml).data
			jQuery('#c1').hide("slow",function(){
				jQuery('#c2').show("slow",function(){
					//data.forms.form.forEach(function(form){
					//form['map'].invalidateSize()
					//form['map'].fitBounds(form['layer'].getBounds());	
					ProcessFile(data)
				//})
			});	
			});
			
		}
	}, false);
	dropbox.addEventListener("click", function(){
		jQuery("#upload").click();
	});




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
