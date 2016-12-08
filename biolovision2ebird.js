var eBird_birds_list;
jQuery.getJSON("http://zoziologie.raphaelnussbaumer.com/wp-content/plugins/biolovision2eBird/patch_ornitho2eBird.json", function(data){
	eBird_birds_list = data;
});

// Variable to put in workspace
var data, meta, csv_content, d, matchCode, reader, code_list=[],eBird_label=[],table=[],geojsonLayer,staticLink, map;
color_gradient = ['#000000','#352A87', '#363093', '#3637A0', '#353DAD', '#3243BA', '#2C4AC7', '#2053D4', '#0F5CDD', '#0363E1', '#0268E1', '#046DE0', '#0871DE', '#0D75DC', '#1079DA', '#127DD8', '#1481D6', '#1485D4', '#1389D3', '#108ED2', '#0C93D2', '#0998D1', '#079CCF', '#06A0CD', '#06A4CA', '#06A7C6', '#07A9C2', '#0AACBE', '#0FAEB9', '#15B1B4', '#1DB3AF', '#25B5A9', '#2EB7A4', '#38B99E', '#42BB98', '#4DBC92', '#59BD8C', '#65BE86', '#71BF80', '#7CBF7B', '#87BF77', '#92BF73', '#9CBF6F', '#A5BE6B', '#AEBE67', '#B7BD64', '#C0BC60', '#C8BC5D', '#D1BB59', '#D9BA56', '#E1B952', '#E9B94E', '#F1B94A', '#F8BB44', '#FDBE3D', '#FFC337', '#FEC832', '#FCCE2E', '#FAD32A', '#F7D826', '#F5DE21', '#F5E41D', '#F5EB18', '#F6F313', '#F9FB0E'];


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

// Compute distence of list
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2-lat1);  // deg2rad below
	var dLon = deg2rad(lon2-lon1); 
	var a = 
	Math.sin(dLat/2) * Math.sin(dLat/2) +
	Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
	Math.sin(dLon/2) * Math.sin(dLon/2)
	; 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; // Distance in km
	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI/180)
}

function dist(list){
	dist=0;
	for (var i=0; i<list.length-1; i++) {
		dist = dist + getDistanceFromLatLonInKm(list[i][0],list[i][1],list[i+1][0],list[i+1][1]);
	}
	return dist
}


// Function when file uploaded
function handleFiles(files) {
	reader = new FileReader();
	reader.readAsText(files[0],'ISO-8859-15');
	reader.onload = function(evt){
		// use papaparse to read the file content
		papaparse = Papa.parse(evt.target.result,{header: true,encoding: "ISO-8859-15"});
		data=papaparse.data;
		meta = papaparse.meta;
		
		//data = jQuery.parseJSON(xml2json(jQuery.parseXML(reader.result)).replace('undefined','')).data.sightings.sighting
		//data = xml2json(jQuery.parseXML(reader.result))
		// put data in the workspace for debug
		d = data[0];

		// export JSON
		if (document.getElementById("geojson").checked){
			// get all the time of the checklist in minute
			var timing_all = data.map(function(d) {
				var time = d.TIMING.split(':');
				return parseInt(time[0])*60+parseInt(time[1]);
			});
			var min = Math.min(...timing_all.filter(Boolean))
			var max = Math.max(...timing_all.filter(Boolean))
			// Finc the color in the gradient.
			var color = timing_all.map(function(t) {
				var r = Math.round(  (t - min )/(max-min) * color_gradient.length )+1
				r = r || 0
				r= (r>=color_gradient.length) ? color_gradient.length-1 : r;
				return r 
			});
			
			data.forEach(function(d,id) {
				var title = d.ESTIMATION_CODE+d.TOTAL_COUNT+' '+d.NAME_SPECIES;
				var description = '<b>Date:</b> '+d.DATE+' '+d.TIMING + '<br><b>Specie:</b> '+d.NAME_SPECIES +'(<i>'+d.LATIN_SPECIES+'</i>)<br>'+'<b>Place:</b> '+d.PLACE+' / '+d.MUNICIPALITY+' ('+d.COUNTY+') - '+d.ALTITUDE+'m<br><b>Observation:</b> '+ d.ESTIMATION_CODE + d.TOTAL_COUNT + ' ind. (atlas code:'+d.ATLAS_CODE+') '+ '<br>ID: <a href="http://www.'+ jQuery('#sel-website').val() +'/index.php?m_id=54&id='+d.ID_SIGHTING+'">'+d.ID_SIGHTING+'</a>';
				var mark = L.marker([parseFloat(d.COORD_LAT),parseFloat(d.COORD_LON)],{
					title: title,
					alt: title,
					icon: L.MakiMarkers.icon({
						icon: Math.min(d.TOTAL_COUNT,99), 
						color: color_gradient[color[id]], 
						size: "m"
					})
				})
				var feature = mark.feature = mark.feature || {};
				feature.type = "Feature";
				feature.properties = feature.properties || {};
				feature.properties['date'] = d.DATE + " " + d.TIMING;
				feature.properties['specie'] = d.NAME_SPECIES;
				feature.properties['place'] = d.PLACE;
				feature.properties['observer'] = '';
				feature.properties['count'] = d.ESTIMATION_CODE + d.TOTAL_COUNT;
				feature.properties['comment'] = d.DETAIL + "<br>" +d.COMMENT;
				feature.properties['img'] = '';
				feature.properties['id'] = d.ID_SIGHTING
				feature.properties['marker-color'] = color_gradient[color[id]]
				feature.properties['marker-size'] = 'm'
				feature.properties['marker-symbol'] = d.TOTAL_COUNT
				mark.addTo(geojsonLayer).bindPopup(description);
			});
			
			jQuery('#mapidcontainer').css('display','block')
			map.fitBounds(geojsonLayer.getBounds());
			StaticLink()
		}
	};
}

function ExportGeojson(){
	var downloadLink = document.createElement("a");
	var blob = new Blob([JSON.stringify(geojsonLayer.toGeoJSON(), null, 2)], {type: "application/json"});
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = d.DATE_YEAR+d.DATE_MONTH+d.DATE_DAY+'_'+d.PLACE.replace(/\ /g,'_')+".geojson";
	downloadLink.click();
}

function StaticLink(){
	map.fitBounds(geojsonLayer.getBounds());
	staticLink = "https://api.mapbox.com/v4/mapbox."+jQuery( "#mapID option:selected" ).val()+"/"
	geojsonLayer.toGeoJSON().features.forEach(function(val,id){
		if ('ID_SIGHTING' in val.properties) {
			staticLink += "pin-"+val.properties['marker-size']+"-"+val.properties['marker-symbol']+"+"+val.properties['marker-color'].split("#")[1]+"("+val.geometry.coordinates[0]+","+val.geometry.coordinates[1]+"),"
		} else {
			coord = val.geometry.coordinates;
			coord.forEach(function(val2, id2){
				coord[id2][1] = geojsonLayer.toGeoJSON().features[id].geometry.coordinates[id2][0]
				coord[id2][0] = geojsonLayer.toGeoJSON().features[id].geometry.coordinates[id2][1]
			})
			staticLink += "path("+encodeURIComponent(L.PolylineUtil.encode(coord , 5))+"),"
		}
	})
	staticLink = staticLink.substring(0, staticLink.length - 1);
	staticLink += "/"+geojsonLayer.getBounds().getCenter().lng + ","
	staticLink += geojsonLayer.getBounds().getCenter().lat + ","
	staticLink += map.getZoom() + "/"
	staticLink += "800x450@2x.png"
	staticLink += "?access_token=" + L.MakiMarkers.accessToken
	jQuery('#static-link').html(staticLink)
	jQuery('#dynamic-link').html(JSON.stringify(geojsonLayer.toGeoJSON(), null, 2))
	jQuery('#static-img')[0].src=staticLink
	jQuery('#dynamic-img')[0].href="http://zoziologie.raphaelnussbaumer.com/geojson?geojson=" + encodeURIComponent(JSON.stringify(geojsonLayer.toGeoJSON(), null, 2))
}

function run(){
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


// Define behavor of the drag
function dragenter(e) {
	e.stopPropagation();
	e.preventDefault();
}
function dragover(e) {
	e.stopPropagation();
	e.preventDefault();
}
function drop(e) {
	e.stopPropagation();
	e.preventDefault();
	var dt = e.dataTransfer;
	var files = dt.files;
	handleFiles(files);
}


jQuery(document).ready(function(){    
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
		window.open("http://www."+jQuery('#sel-website').val()+"/index.php?m_id=97&sp_DChoice=" + DChoice + "&sp_DFrom="+jQuery('#input-date-from').val()+"&sp_DTo="+jQuery('#input-date-to').val()+"&sp_DOffset="+ jQuery('#date_ago').val() +"&sp_SChoice=all&sp_PChoice=all&sp_OnlyMyData=1&sp_FChoice=export&sp_FExportFormat=TXT")
	});

	// Button to write to file
	jQuery('#buttonrun-id').click( run );

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

	// Drag and drop
	dropbox = document.getElementById("dropbox");
	dropbox.addEventListener("dragenter", dragenter, false);
	dropbox.addEventListener("dragover", dragover, false);
	dropbox.addEventListener("drop", drop, false);
	dropbox.addEventListener("click", function(){
		jQuery("#upload").click();
	});
	document.getElementById('upload').onchange = function(e){
		handleFiles(e.target.files)
	}

	// Create map
	map = L.map('mapid');
	L.tileLayer.provider('MapBox', {id: 'rafnuss.npl3amec', accessToken:''}).addTo(map);
	
	L.MakiMarkers.accessToken = "";

	var editableLayers = new L.FeatureGroup().addTo(map);

	geojsonLayer =  L.geoJson().addTo(map);

	var drawControl = new L.Control.Draw({
		position: 'topright',
		draw: {
			polyline: true,
			polygon: true,
			circle: true,
			rectangle: true, 
			marker: true,
		},
		edit: {
            featureGroup: geojsonLayer, //REQUIRED!!
        }
    })
	map.addControl(drawControl);

	map.on('draw:created', function (e) {
		geojsonLayer.addLayer(e.layer);
		StaticLink()
		map.fitBounds(geojsonLayer.getBounds());
	});


	jQuery( "#mapID" ).change(function() {
		StaticLink();
	});
});
