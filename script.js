//____________________________________________________
//                Biolovision2eBird
//____________________________________________________
// This script goes with the website zoziologie.raphaelnussbaumer.com/biolovision2ebird to generate eBird csv import file from any biolovision websites



//____________________________________________________
//                DECLARE VARIABLE
//____________________________________________________

// Load conversion taxonomie biolovision - eBird
var eBird_birds_list;
jQuery.getJSON("./patch_ornitho2eBird.min.json", function(data){
	eBird_birds_list = data;
});


// Color for markers to create/merge checklist
var marker_color = [['white','#ffffff','black'],['red','#D63E2A','white'],['orange','#f69730','white'],['green','#72B026','white'],['blue','#38A9DC','white'],['purple','#CD50B5','white'],['darkred','#A23336','white'],['darkgreen','#728224','white'],['darkpurple','#593869','white'],['cadetblue','#436877','white'],['red','#D63E2A','black'],['orange','#f69730','black'],['green','#72B026','black'],['blue','#38A9DC','black'],['purple','#CD50B5','black'],['darkred','#A23336','black'],['darkgreen','728224','black'],['darkpuple','#593869','black'],['cadetblue','#436877','black'],['red','#D63E2A','grey'],['orange','#f69730','grey'],['green','#72B026','grey'],['blue','#38A9DC','grey'],['purple','#CD50B5','grey'],['darkred','#A23336','grey'],['darkgreen','728224','grey'],['darkpuple','#593869','grey'],['cadetblue','#436877','grey'],['white','#ffffff','black'],['red','#D63E2A','white'],['orange','#f69730','white'],['green','#72B026','white'],['blue','#38A9DC','white'],['purple','#CD50B5','white'],['darkred','#A23336','white'],['darkgreen','#728224','white'],['darkpurple','#593869','white'],['cadetblue','#436877','white'],['red','#D63E2A','black'],['orange','#f69730','black'],['green','#72B026','black'],['blue','#38A9DC','black'],['purple','#CD50B5','black'],['darkred','#A23336','black'],['darkgreen','728224','black'],['darkpuple','#593869','black'],['cadetblue','#436877','black'],['red','#D63E2A','grey'],['orange','#f69730','grey'],['green','#72B026','grey'],['blue','#38A9DC','grey'],['purple','#CD50B5','grey'],['darkred','#A23336','grey'],['darkgreen','728224','grey'],['darkpuple','#593869','grey'],['cadetblue','#436877','grey'],['white','#ffffff','black'],['red','#D63E2A','white'],['orange','#f69730','white'],['green','#72B026','white'],['blue','#38A9DC','white'],['purple','#CD50B5','white'],['darkred','#A23336','white'],['darkgreen','#728224','white'],['darkpurple','#593869','white'],['cadetblue','#436877','white'],['red','#D63E2A','black'],['orange','#f69730','black'],['green','#72B026','black'],['blue','#38A9DC','black'],['purple','#CD50B5','black'],['darkred','#A23336','black'],['darkgreen','728224','black'],['darkpuple','#593869','black'],['cadetblue','#436877','black'],['red','#D63E2A','grey'],['orange','#f69730','grey'],['green','#72B026','grey'],['blue','#38A9DC','grey'],['purple','#CD50B5','grey'],['darkred','#A23336','grey'],['darkgreen','728224','grey'],['darkpuple','#593869','grey'],['cadetblue','#436877','grey']];

var atlas_code = {
	'1':'Species heard or observed within safe dates, but not in suitable breeding habitat.',
	'2':'Species heard or observed within safe dates, and in suitable breeding habitat',
	'3':'Territorial behavior, including counter singing males, territorial singing (repeatedly singing from same locations within an area), drumming in woodpeckers, or aggressive interactions between same-sex individuals of same species ',
	'4':'Pair (male and female) within safe dates, and in suitable breeding habitat',
	'5':'Pair (male and female) present at the same location 2 or more days apart',
	'6':'Courtship behavior (aerial displays, courtship feeding) or copulation',
	'7':'Visiting probable nest site',
	'8':'Agitated behavior and/or anxiety calls from an adult, suggesting presence of nearby nest or young',
	'9':'Brood patch (Note: code only applies to birds observed in hand and is reserved for experienced birder only)',
	'10':'Nest building observed at nest site (Note: for nest building by wrens, woodpeckers, kingfisher...)',
	'11':'Distraction display (especially injury feigning, such as broken wing display) or attacking/dive-bombing humans in defense of unobserved nest or young',
	'12':'Used nest (occupied within period of survey); includes inactive nests',
	'13':'Recently fledged young that are incapable of sustained flight',
	'14':'Occupied nest, but contents not observed; adults entering and remaining for a period of time, then leaving or exchanging duties',
	'15':'Adult carrying a fecal sac',
	'16':'Adult carrying food for young',
	'17':'Eggshells found below nest',
	'18':'Nest with adult incubating',
	'19':'Nest with nestlings or eggs',
	'30':'Possible breeding',
	'40':'Probable breeding',
	'50':'Confirmed breeding',
	'99':'Species not recorded despite active search',
}










//____________________________________________________
//                RANDOM and DIVERS FUNCTIONS
//____________________________________________________


// color of the marker in the static map export
function color(s,form){
	color_gradient = ['#fff','#352A87', '#363093', '#3637A0', '#353DAD', '#3243BA', '#2C4AC7', '#2053D4', '#0F5CDD', '#0363E1', '#0268E1', '#046DE0', '#0871DE', '#0D75DC', '#1079DA', '#127DD8', '#1481D6', '#1485D4', '#1389D3', '#108ED2', '#0C93D2', '#0998D1', '#079CCF', '#06A0CD', '#06A4CA', '#06A7C6', '#07A9C2', '#0AACBE', '#0FAEB9', '#15B1B4', '#1DB3AF', '#25B5A9', '#2EB7A4', '#38B99E', '#42BB98', '#4DBC92', '#59BD8C', '#65BE86', '#71BF80', '#7CBF7B', '#87BF77', '#92BF73', '#9CBF6F', '#A5BE6B', '#AEBE67', '#B7BD64', '#C0BC60', '#C8BC5D', '#D1BB59', '#D9BA56', '#E1B952', '#E9B94E', '#F1B94A', '#F8BB44', '#FDBE3D', '#FFC337', '#FEC832', '#FCCE2E', '#FAD32A', '#F7D826', '#F5DE21', '#F5E41D', '#F5EB18', '#F6F313', '#F9FB0E'];
	var t = moment(s.date["@ISO8601"]).hour()*60+moment(s.date["@ISO8601"]).minute();
	var start = parseInt(form.time_start.split(':')[0])*60 + parseInt(form.time_start.split(':')[1]);
	var r = Math.round(  (t - start )/form.duration * (color_gradient.length-1) )+1;
	r = (r<0 || isNaN(r)) ? 0 : r;
	r = (r>=color_gradient.length) ? color_gradient.length-1 : r;
	return color_gradient[r].split('#')[1]
}

// convert csv to JSON
function csvJSON(csv,delim){
	csv = csv.replace(/"([^"]*)"/g, function (m,g) {
		return g.replace(/\b([\r\n]+)\b|[\r\n]+/g, function(n,h) {
			return h ? ' ' : '';
		});
	});

	var lines=csv.split("\n").map(e => e.replace(/(\r\n|\n|\r)/gm, ""));
	lines = lines.filter( e=> !(/^[,]*$/.test(e)) )
	var result = [];
	var headers=lines[0].split(delim);
	for(var i=1;i<lines.length;i++){
		var obj = {};
		var currentline=lines[i].split(delim);
		for(var j=0;j<headers.length;j++){
			obj[headers[j]] = currentline[j];
		}
		result.push(obj);
	}
	return result;
}


// convert coordinate from 46.3523462133 to 46°56'34''
function deg_to_dms(deg) {
	var d = Math.floor (deg);
	var minfloat = (deg-d)*60;
	var m = Math.floor(minfloat);
	var secfloat = (minfloat-m)*60;
	var s = Math.round(secfloat);
	// After rounding, the seconds might become 60. These two if-tests are not necessary if no rounding is done.
	if (s==60) { m++; s=0; }
	if (m==60) { d++; m=0; }
	return (d + "°" + m + "'" + s+'"');
}

// Create the general comment of checklist
function previewComment(form){
	var html = jQuery('#f-'+form.id+' .comments').val() +'<br>';
	/*if (jQuery('#f-'+form.id+' .check-weather').is(':checked') ){
		html += form.weather;
	} */
	if (jQuery('#f-'+form.id+' .check-static-map').is(':checked')){
		if (jQuery("#incl-map-link").prop("checked")) {
			html += '<a href="'+form.gist+'" target="_blank">'
			html += '<img src="'+staticLink(form)+'" style="max-width:600px;width:100%"></a><br>'
		} else {
			html += '<img src="'+staticLink(form)+'" style="max-width:600px;width:100%"><br>'
		}
		jQuery('#f-'+form.id+ ' .zoom').attr('disabled', false);
		jQuery('#f-'+form.id+ ".btn-number").attr('disabled', false);
		form.layer.msm.addTo(form.map);
		jQuery('#center-map').removeClass('disabled')
	} else {
		jQuery('#f-'+form.id+ ' .zoom').attr('disabled', true);
		jQuery('#f-'+form.id+ ".btn-number").attr('disabled', true);
		form.layer.msm.removeFrom(form.map);
		jQuery('#center-map').addClass('disabled')
	}
	html += '<br>Imported with <a href=\"https://zoziologie.raphaelnussbaumer.com/biolovision2ebird/\" target=\"_blank\">biolovision2eBird</a>';
	jQuery('#f-'+form.id+' .comments-preview').html(html);
	form.comment=html;
};

// Create the specie comment 
function SpComment(form,s){
	var cmt = jQuery("<div></div>").append(jQuery('#cmt-sp-ct-bt-'+ form.id).html());
	jQuery(cmt).find('span').each(function(){
		jQuery(this).replaceWith(eval(jQuery(this).attr('value')));
	})
	cmt = cmt.text().replace(/	/g,'');
	cmt = cmt.replace(/<br><br><br>/g,'<br>');
	cmt = cmt.replace(/<br><br>/g,'<br>');
	cmt = cmt.replace(/- 00:00/g,'');
	return cmt
}

// Display specie comment 
function previewSpComment(form){
	s=form.sightings[jQuery('#f-'+form.id+' .cmt-sp-preview-sp').val()]
	cmt = SpComment(form,s)
	jQuery('#f-'+form.id+' .cmt-sp-preview').html(cmt)
}

// Create the static map for a form
function staticLink(form){
	var limit=3300;
	var fs = form.layer.sightings.toGeoJSON();
	form.layer.edit.toGeoJSON().features.forEach(function(f){
		fs.features.push(f);
	})
	var sl = "https://api.mapbox.com/v4/mapbox.satellite/"
	fs.features.forEach(function(f){
		if (f.geometry.type==="LineString" && sl.length<limit) {
			var coord = f.geometry.coordinates.slice();
			coord.forEach(function(c,id){
				var a = c[0];
				c[0] = c[1];
				c[1] =a;
			})
			sl += "path-5+AD8533("+encodeURIComponent(L.PolylineUtil.encode(coord , 5))+"),"
		}
	});
	var duplicate=[];
	fs.features.forEach(function(f){
		if (f.geometry.type==="Point") {
			var d=false;
			for (var i = 0, l=duplicate.length; i < l; i++) {
				if ( duplicate[i][0] ==  f.geometry.coordinates[0] && duplicate[i][1] ==  f.geometry.coordinates[1]) {
					d=true;
					break;
				}
			}
			if (!d && sl.length<limit){
				duplicate.push(f.geometry.coordinates)
				sl += "pin-"+f.properties['marker-size']+"-"+f.properties['marker-symbol']+"+"+f.properties['marker-color']+"("+f.geometry.coordinates[0]+","+f.geometry.coordinates[1]+"),"
			}
		}
	})
	sl = sl.substring(0, sl.length - 1);
	sl += "/"+form.staticmap.lng + ","
	sl += form.staticmap.lat + ","
	sl +=  form.staticmap.zoom + "/"
	sl += "800x450@2x.png"
	sl += "?access_token=" + token.mapbox
	return sl
}

//Find zoom for static map
function getBoundsZoomLevel(bounds, mapDim) {
	var WORLD_DIM = { height: 256, width: 256 };
	var ZOOM_MAX = 21;
	function latRad(lat) {
		var sin = Math.sin(lat * Math.PI / 180);
		var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
		return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
	}
	var lngDiff = bounds.getNorthEast().lng - bounds.getSouthWest().lng;
	var latFraction = latRad(lngDiff) / Math.PI;
	var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;
	var latZoom = Math.floor(Math.log(mapDim.height / WORLD_DIM.height / latFraction) / Math.LN2);
	var lngZoom = Math.floor(Math.log(mapDim.width / WORLD_DIM.width / lngFraction) / Math.LN2);
	return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

// Create marker for sigthing in the assigement of checklists
function Makemarker(s){
	var title = s.observers[0].count+' '+(s.species.name || s.species.bird_name);
	var description = '<b>'+ s.observers[0].count +' '+ (s.species.name || s.species.bird_name) +' (<i>'+s.species.latin_name+'</i>)</b> <br>';
	description += moment(s.date["@ISO8601"]).format('DD.MM.YYYY  HH:mm') + '<br>';
	
	if (jQuery('#sel-website').val().includes("observation") || jQuery('#sel-website').val().includes("waarneming")) {
		description += '<a href="'+s.link+'" target="_blank">'+s.link+'</a>';
	} else if (jQuery('#sel-website').val().includes("birdtrack") ){
		
	}  else if (jQuery('#sel-website').val().includes("data.biolovision.net") ){
		
	} else if (jQuery('#sel-website').val()=='birdlasser'){
		
	} else {
		//description += s.place.name+' / '+s.place.municipality+' ('+s.place.county+') <br>';
		description += '<a href="'+s.link+'" target="_blank">'+s.link+'</a>';
	}
	if (s.observers[0].medias){
		var m = s.observers[0].medias
		for (let i = 0; i < m.length; i++) {
			var link = m[i].path+'/'+m[i].filename;
			description += '<br><a href="'+link+'"><img class="img-fluid" src="'+link+'"></a>'
		  }
		
	}
	var mark = L.marker([s.observers[0].coord_lat,s.observers[0].coord_lon],{
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
	feature.properties['date'] = moment(s.date["@ISO8601"]).format('DD.MM.YYYY HH:MM');
	feature.properties['specie'] = (s.species.name || s.species.bird_name);
	feature.properties['latin'] = s.species.latin_name;
	feature.properties['place'] = s.place.name+' / '+s.place.municipality+' ('+s.place.county+') - '+s.place.altitude+'m';
	feature.properties['observer'] = s.observers[0].name;
	feature.properties['count'] = s.observers[0].count;
	feature.properties['comment'] = '';
	feature.properties['img'] = '';//s.observers[0].medias.path;
	feature.properties['id'] = (s.observers[0].id_sighting || s.observers[0].id_universal);
	feature.properties['marker-color'] = s['marker-color'];
	feature.properties['marker-size'] = s['marker-size'];
	feature.properties['marker-symbol'] = s['marker-symbol'];
	feature.properties['description'] = description;
	feature.properties['link'] = s.link
	return mark
}

function addHotspot(marker){
	data.forms.n +=1;
	var form = {
		id: data.forms.n,
		color:marker_color[data.forms.n],
		name: 'New List ' + data.forms.n.toString() +' '+ marker.getLatLng().toString().split('LatLng')[1],
		sightings: [],
		marker: marker,
		full_form: false
	}
	data.forms.push(form)
	// update marker
	marker.setIcon(L.AwesomeMarkers.icon({
		icon: 'list',
		prefix:"fa",
		markerColor: form.color[0],
		iconColor: form.color[2]
	})).on('click',function(){
		jQuery('#selHotspot').val(form.id).change();
	}).addTo(modalfLayer);
	marker.id = form.id;
	jQuery('#selHotspot').append(jQuery('<option>', {value: form.id, text: form.name, style: "background-color:"+form.color[1]+";color:"+form.color[2]+";"}));
	jQuery('#selHotspot').val(form.id).change();
	return form.id
}

// Export file 
var downloadfx = function(){
	if (jQuery('input[type=radio][value=offset]').prop("checked")){
		var DChoice='offset';
		var d_t = new Date;
		var d_f = new Date;
		d_f.setDate(d_f.getDate()-parseFloat(jQuery('#date_ago').val())+1);
	} else {
		var DChoice='range';
		var d_f = new Date(jQuery('#input-date-from').val())
		var d_t = new Date(jQuery('#input-date-to').val())
	}
	if (jQuery('#sel-website').val().includes("observation") || jQuery('#sel-website').val().includes("waarneming")) {
		alert('Data from observation.org can be exported from the Observations menu. Login and click on your name top right of the page.')
		window.open("https://observation.org/")
	} else if (jQuery('#sel-website').val().includes("birdtrack") ){
		window.open("https://app.bto.org/birdtrack/explore/emr.jsp")
	}  else if (jQuery('#sel-website').val().includes("data.biolovision.net") ){
		window.open("http://"+jQuery('#sel-website').val()+"/index.php?m_id=1351&content=search&start_date="+moment(d_f).format('DD.MM.YYYY')+"&stop_date="+moment(d_t).format('DD.MM.YYYY'))
	} else if (jQuery('#sel-website').val()=='birdlasser'){
		alert('Data from birdlasser can only be downloaded from the app (to my knowledge). Selec the trip card and use "Export (CSV) trip card". Upload the CSV file below.')
	} else {
		link = "http://"+jQuery('#sel-website').val()+"/index.php?m_id=31&sp_DChoice=" + DChoice + "&sp_DFrom="+moment(d_f).format('DD.MM.YYYY')+"&sp_DTo="+moment(d_t).format('DD.MM.YYYY')+"&sp_DOffset="+ jQuery('#date_ago').val() +"&sp_SChoice=all&sp_PChoice=all&sp_OnlyMyData=1";//&sp_FChoice=export&sp_FExportFormat=XML";
		window.open(link)
	}
}

// Language Patch
var languagePatch = function(s){
	var name = [['LEVEL', 'id', 'Scientific name', 'name', 'Euring', 'Species id', 'family', 'species group', 'SPECIES_STATUS', 'Date', 'Time', 'date submitted', 'timestamp', 'TYPE_OBSERVATION', 'Number', 'min', 'max', 'sex', 'meaning of number', 'plumage', 'Activity', 'X', 'Y', 'lat', 'Lng', 'Biotope', 'Area', 'municipal', 'Province', 'certain', 'escape', 'link', 'precisie', 'loc_methode', 'protocol', 'status', 'Photos', 'collection nr', 'hostplant', 'substrate', 'method', 'Comments', 'Location', 'Tags', 'Transects'],['niveau', 'ID', 'Wetenschappelijke naam', 'Naam', 'Euring', 'Species id', 'Familie', 'Soortgroep', 'Soortstatus', 'Datum', 'Tijd', 'invoerdatum', 'timestamp', 'type waarneming', 'Aantal', 'min', 'max', 'Geslacht', 'telmethode', 'Kleed', 'Gedrag', 'X', 'Y', 'lat', 'Lng', 'Biotoop', 'Gebied', 'Gemeente', 'Provincie', 'Zeker', 'escape', 'link', 'precisie', 'loc_methode', 'protocol', 'status', "Foto's", 'Collectienr.', 'Waardplant', 'substraat', 'Methode', 'Toelichting', 'Locatie', 'Tags', 'Transecten']]
	name[1].forEach(function (item, index) {
		if (item in s) {
			Object.defineProperty(s, name[0][index], Object.getOwnPropertyDescriptor(s, item));
			delete s[item];
		}
	});
	return s
}

//lat,lon to km
function distance(lat1, lon1, lat2, lon2) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(Math.PI * (lon1-lon2)/180);
		if (dist > 1) {
			dist = 1;
		}
		return Math.acos(dist) * 180/Math.PI * 60 * 1.1515 * 1.609344
	}
}

// Find the more recurrent element in a list
function mode(arr){
    return arr.sort((a,b) =>
          arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
    ).pop();
}

























//____________________________________________________
//                CREATE FUNCTIONS
//____________________________________________________
// handleFile() -> ProcessSightings() -> ProcessForm()
//              -> ProcessForm()



function handleFile(file){

	var ext = file.name.split('.').pop().toLowerCase();

	var reader = new FileReader();
	if (ext == 'xlsx'){
		reader.readAsBinaryString(file);
	} else {
		reader.readAsText(file);//,'ISO-8859-15');
	}
	
	reader.onload = function(e){

		// Add limit in dataset size

		if (jQuery('#sel-website-link').val().includes("observation") || jQuery('#sel-website-link').val().includes("waarneming")) {
			if (ext != 'csv'){
				alert('You can only upload csv file for waarneming/observado/observation website. Make sure to export in this format and retry. If the problem continue, contact rafnuss@gmail.com with your exported file')
				return
			}
			//alert('You are trying to convert waarneming/observado data to eBird? This script is not working fully yet. If you are interested, please contact me at rafnuss@gmail.com')				
			var sightings = Papa.parse(reader.result,{header:true, skipEmptyLines:'greedy'}).data

			data={};
			data.sightings=[];
			data.forms=[];
			
			sightings.forEach(function(s){
				//var s = languagePatch(s);
				var c = ''
				if (s['counting method']!='unknown' & s['counting method']!='') c += s['counting method'] + ', '
				if (s.method!="unknown" & s.method!="") c += s.method + ', '
				if (s.sex!='U') c += s.sex + ', '
				if (s['life stage']!='unknown') c += s['life stage'] + ', '
				if (s.activity!='present') c += s.activity + ', '
				if (!s['is certain']=="TRUE") c += 'not certain' + ', '
				if (s['is escape']=="TRUE") c += 'escape' + ', '
				if (s['has photos']=="TRUE") c += 'photos' + ', '
				if (s['has sounds']=="TRUE") c += 'sounds' + ', '
				if (s['notes']!="") c += s['notes'] + ', '
				c = c.slice(0, -2)
				var datetmp = new Date(s.date.split(/[//-]+/)[2], s.date.split(/[//-]+/)[1]-1, s.date.split(/[//-]+/)[0], s.time.split(':')[0], (s.time.split(':')[1] ? s.time.split(':')[1] : '')).toISOString()
				ns={
					date:{
						'@ISO8601': datetmp, 
					},
					observers:[{
						count: s.number,
						estimation_code: s['meaning of number'],
						id_sighting: s.id,
						link: s.link,
						coord_lat: s.lat,
						coord_lon: s.lng,
						comment:  c+s.notes,
						timing:{
							'@ISO8601': datetmp,
						}
					}],
					place:{
						name: s.location,
					},
					species:{
						"latin_name": s['scientific name'],
						name: s['species name'],
					}
				};
				data.sightings.push(ns);
			})
		} else if (jQuery('#sel-website-link').val().includes("birdtrack") ){
			if (ext != 'xlsx'){
				alert('You can only upload xlsx file for birdtrack website. Make sure to export in this format and retry. If the problem continue, contact rafnuss@gmail.com with your exported file')
				return
			}
			alert('You are trying to convert birdtrack data to eBird? This is a beta version. If you have any issues, please contact me at rafnuss@gmail.com')				
			
			var workbook = XLSX.read(e.target.result, {type: 'binary', cellDates:true, cellStyles:true});
			var sightings = XLSX.utils.sheet_to_row_object_array(workbook.Sheets['Records#1']);

			data={};
			data.sightings=[];
			data.forms=[];

			sightings.forEach(function(s){
				s.Date = s.Date.split(/[//-]+/)[1] + '/' + s.Date.split(/[//-]+/)[0] + '/' + s.Date.split(/[//-]+/)[2];
				ns={
					date:{
						'@ISO8601' :  moment(s.Date+' '+s['Start time']).toISOString(),
					},
					observers:[{
						count: s.Count,
						estimation_code: '',
						id_sighting: '',
						coord_lat: s.Lat,
						coord_lon: s.Long,
						comment: s.Comment,
						details:[],
						timing:{},
						atlas_code:{
							'#text': s['Breeding status'],
						}
					}],
					place:{
						county: '',
						name: s.Place,
						municipality: ''
					},
					species:{
						'latin_name': s['Scientific name'],
						name: s.Species,
					}
				};

				idx = data.forms.findIndex(function(f){
					return f.name == s.Place & f.date == s.Date & f['time_start']== s['Start time'] 
				})

				if (idx>-1){
					data.forms[idx].sightings.push(ns)
				} else {
					data.forms.push({
						"@id":data.forms.length+1,
						"date":s.Date,
						"name" : s.Place,
						"time_start": s['Start time'],
						"time_stop": s['End time'],
						"full_form": s['End time'] =='' ? '0' : (s['End time'] == s['Start time'] ? '0' : "1"),
						"lat": s.Lat,
						"lon": s.Long,
						'sightings':[ns]
					})
				}
			})

		} else if (jQuery('#sel-website-link').val().includes("birdlasser")) {
			if (ext != 'csv'){
				alert('You can only upload csv file for birdlasser website. The csv file can be generated on the phone app birdlasser. If the problem continue, contact rafnuss@gmail.com with your exported file')
				return
			}
			var sightings = csvJSON(reader.result,",")
			data={};
			data.sightings=[];
			data.forms=[];

			const formsid = [...new Set(sightings.map(s => s.form))];

			sightings.forEach(function(s){
				//s = languagePatch(s);
				ns={
					date:{
						'@ISO8601': s["ISO date"], 
					},
					observers:[{
						count: s.Count,
						estimation_code: s['Count exact'].toLowerCase()=='false' ? 'NO_VALUE' : 'EXACT_VALUE',
						coord_lat: parseFloat(s.Latitude),
						coord_lon: parseFloat(s.Longitude),
						comment: s.Notes, //s['Seen/Heard']+', '+
						id_sighting: Math.random(),
					}],
					place:{},
					species:{
						'latin_name': s['Species tertiary name'],
						name: s['Species primary name'],
					}
				};

				// Patch to create form manually in the csv file
				if (s.form){
					data.forms[formsid.indexOf(s.form)].sightings.push(ns);
				} else {
					data.sightings.push(ns);
				}
				
			})

			
		} else {
			if (ext != 'json'){
				alert('You can only upload json file for biolovision website (ornitho, faune- and data.biolovision.net. Make sure to export in this format and retry. If the problem continue, contact rafnuss@gmail.com with your exported file')
				return
			}
			data = jQuery.parseJSON(reader.result).data;
			// Two types of JSON can be imported: faune-france or biolovision.data
			if (data.forms==undefined) {data.forms=[];}
			if (data.sightings==undefined) {data.sightings=[];}
			// Time is not included in s.date, take it form s.observers.timing
			data.forms.forEach(function(f){ 
				f.sightings.forEach(function(s){
					s.date=s.observers[0].timing;
					s.link = 'http://'+jQuery('#sel-website').val()+'/index.php?m_id=54&id='+(s.observers[0].id_sighting || s.observers[0].id_universal);
					//if (s.date==undefined) {s.date=s.observers[0].timing;}
				})
			})
			data.sightings.forEach(function(s){
				s.link = 'http://'+jQuery('#sel-website').val()+'/index.php?m_id=54&id='+(s.observers[0].id_sighting || s.observers[0].id_universal);
				if (s.observers[0].timing != undefined){
					s.date=s.observers[0].timing;
				}
				if (s.date["@ISO8601"] == undefined){
					s.date["@ISO8601"] = new Date(s.date["@timestamp"]*1000).toISOString();
				}
			})
		}

		// Sort sightings
		var b = data.sightings.sort((a, b) => {
			(a.date['@ISO8601'] > b.date['@ISO8601']) ? -1 : 1
		})
		
		data.forms.forEach(function(f,idx){
			f.color = marker_color[idx+1];
			f.id=idx+1;
			f.name=f.sightings[0].place.name;
			f.time_start = moment(f.time_start,"HH:mm").format("HH:mm") // 9:1 -> 09:01
		});
		data.forms.n=data.forms.length-1;
		
		if (data.sightings.length>500){
			var psw = prompt('You are trying to convert '+data.sightings.length+' incidental sightings. A significant effort is necessary to group them into eBird checklist format.\
			To avoid data import and quality issues for eBird, Please send me a sample of your data at rafnuss@gmail.com. You can still try this conversion with less than 500 sightings.','If you have it, enter the password received here')
			
			if (psw == "buteobuteo") {
				if (data.sightings.length>10000){
					var psw2 = prompt('The number of sightings is greater than 10\'000 and you will need another password','If you have it, enter the second password received here')
					pass = (psw2 =="charadriusmorinellus") ? true : false;
				} else {
					pass=true
				}
			} else {
				pass=false
			}
		} else {
			pass = true
		}

		if (pass){
			jQuery('html, body').css('overflow-y','auto');
			if (data.sightings.length>0) {
				jQuery('#c1').slideUp("slow",function(){
					jQuery('#c2').slideDown("slow",function(){
						ProcessSightings(data)
					});
					jQuery("#c0").slideUp("slow")
				});
			} else if (data.forms.length>0){
				jQuery('#c1').slideUp("slow",function(){
					jQuery('#c3').slideDown("slow",function(){
						ProcessForms(data)
						jQuery('#c4').slideDown("slow")
					});
					jQuery("#c0").slideUp("slow")
				});
				
			} else {
				alert('Empty file')
				return
			}
		} else {
			alert('The password entered is incorrect. Please, contact me at rafnuss@gmail.com')
		}

	}

}


function ProcessSightings(data) {
	data.forms.unshift({ // Create the checklist for Non-Assigned
		name: 'Non-Assigned',
		id:0,
		color: marker_color[0],
		sightings: [],
		marker: NaN,
		full_form: false
	})
	data.forms.n += 1;
	
	// Initiate map
	modalmap = L.map('modal-map');
	L.control.layers({
		'MapBox': L.tileLayer.provider('MapBox', {id: 'mapbox/streets-v11', accessToken:token.mapbox}).addTo(modalmap),
		'Mapbox Sattelite' : L.tileLayer.provider('MapBox', {id: 'mapbox/satellite-v9', accessToken:token.mapbox}),
		'OpenStreetMap' : L.tileLayer.provider('OpenStreetMap.Mapnik'),
		'Swisstopo': new L.TileLayer('https://wmts10.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg', {
		layer: 'ch.swisstopo.pixelkarte-farbe-pk1000.noscale',
		maxZoom: 17,
		attribution: 'Map data &copy; 2015 swisstopo',
		})
	},null,{collapsed:true}).addTo(modalmap);
	modalfLayer = new L.FeatureGroup().addTo(modalmap);
	new L.Control.Draw({
		position: 'topright',
		draw: {
			polyline: false,
			polygon: false,
			circle: false,
			circlemarker: false,
			rectangle: true, 
			marker: {
				icon: L.AwesomeMarkers.icon({
					icon: 'list',
					prefix: 'fa'
				})
			}
		},
		edit: {
			featureGroup: modalfLayer
		}
	}).addTo(modalmap)
	modalmap.on('draw:created', function (e) {
		if (e.layerType === 'marker'){
			addHotspot(e.layer)
		} else if (e.layerType === 'rectangle'){
			modalsLayer.eachLayer(function(l){
				if (e.layer.getBounds().contains(l.getLatLng())){
					data.sightings.forEach(function(s){
						if (l.feature.properties['id'] == (s.observers[0].id_sighting || s.observers[0].id_universal) ){
							data.forms.forEach(function(f){
								if (f.id==jQuery('#selHotspot').val()){
									s['marker-color'] = f.color[1];
									s.form = f.id;
									l.setIcon(Makemarker(s).options.icon)
								}
							})
						}
					})
				}
			})
		}
	}).on('draw:deleted', function(e){
		e.layers.eachLayer(function(l){
			data.forms.forEach(function(f,idx){
				if (f.id == l.id){
					data.forms.splice(idx,1);
					jQuery("#selHotspot option[value='"+f.id+"']").remove();
					jQuery('#selHotspot').change();
				}
			})
		})
	});
	
	// Import Form
	data.forms.forEach(function(form,idx){
		if (idx>0){
			var m = L.marker([form.lat, form.lon],{
				title: form.name,
				alt: form.name,
				icon: L.AwesomeMarkers.icon({
					icon: 'list',
					prefix:'fa',
					markerColor: form.color[0],
					iconColor: form.color[2]
				})
			})
			m.id=form.id;
			form.marker=m;
			m.addTo(modalfLayer).on('click',function(){
				jQuery('#selHotspot').val(form.id).change();
			})
		}
		jQuery('#selHotspot').append(jQuery('<option>', {value: form.id, text: form.name, style: "background-color:"+form.color[1]+";color:"+form.color[2]+";"}));
	});
	
	// Import Sigthings
	modalsLayer = L.markerClusterGroup({
		showCoverageOnHover: false,
		maxClusterRadius:70,
	}).addTo(modalmap);
	
	var uniquedate=[]
	data.sightings.forEach(function(s){
		s['marker-symbol'] = (s.observers[0].count < 99) ? s.observers[0].count : 'x';
		s['marker-color'] = data.forms[0].color[1];
		s['marker-size'] = 's';
		s.form = 0;
		var m = Makemarker(s);
		m.addTo(modalsLayer); 
		uniquedate.push(data.sightings[0].date["@ISO8601"].substring(0,10))
	})
	
	jQuery('#selHotspot').change(function(opt){
		data.forms.forEach(function(f,idx){
			if (f.id == jQuery(opt.target).val()){
				jQuery('#selHotspot').css('background-color',f.color[0])
				jQuery('#selHotspot').css('color',f.color[2])
			}
		})
	})
	
	jQuery('#button-process').click(function(){
		data.sightings.forEach(function(s){
			data.forms.forEach(function(f){
				if (s.form == f.id){
					f.sightings.push(s);
				}
			})
		})
		jQuery('#c2').slideUp("slow",function(){
			jQuery('#c3').slideDown("slow",function(){
				ProcessForms(data)
				jQuery('#c4').slideDown("slow")
			});	
		});
	});
	
	var modalDrawRectangle = new L.Draw.Rectangle(modalmap);
	jQuery('#button-select-hotspot').click(function(){
		modalDrawRectangle.enable();
	})
	var modalDrawMarker = new L.Draw.Marker(modalmap);
	jQuery('#button-create-hotspot').click(function(){
		modalDrawMarker.enable();
	})
	jQuery('#button-auto-assign').click(function(){
		hours_lim = jQuery('#assign_dd').val();
		km_lim = jQuery('#assign_dt').val()/1000;
		jQuery('#button-auto-assign').attr("disabled", true);
		for (var i = 0; i < data.sightings.length; i++) {
			for (var j = 0; j < i; j++) {
				var duration = moment.duration(moment(data.sightings[j].date["@ISO8601"]).diff(moment(data.sightings[i].date["@ISO8601"])));
				var hours = Math.abs(duration.asHours());
				var km = distance(data.sightings[j].observers[0].coord_lat, data.sightings[j].observers[0].coord_lon, data.sightings[i].observers[0].coord_lat, data.sightings[i].observers[0].coord_lon);
				if (hours < hours_lim & km < km_lim){
					data.sightings[i].form = data.sightings[j].form;
					break
				} 
			}

			if (data.sightings[i].form == 0){
				var marker = L.marker([data.sightings[i].observers[0].coord_lat, data.sightings[i].observers[0].coord_lon]);
				var id = addHotspot(marker);
				data.sightings[i].form = id;
			}
		}

		modalsLayer.eachLayer(function(l){
			data.sightings.forEach(function(s){
				if (l.feature.properties['id'] == (s.observers[0].id_sighting || s.observers[0].id_universal) ){
					data.forms.forEach(function(f){
						if (f.id==s.form){
							s['marker-color'] = f.color[1];
							l.setIcon(Makemarker(s).options.icon)
						}
					})
				}
			})
		})
	})
	
	
	setTimeout(function() {
		modalmap.invalidateSize();
		modalmap.fitBounds(modalsLayer.getBounds());
		jQuery('.leaflet-draw-toolbar-top').hide();
		jQuery('#selHotspot').change();
	}, 1);
	
	// Display message if data are spanning over severa days
	uniquedate = uniquedate.filter(function(value, index, self) { 
		return self.indexOf(value) === index;
	})
	if (uniquedate.length==1){
		jQuery('#warning-several-days').hide()
	}
	
};


function ProcessForms(data) {
	// delete forms with empty sightings
	var i = data.forms.length
	while (i--) {
		if (!data.forms[i].sightings[0]) {
			data.forms.splice(i, 1);
		}
	}
	
	//Add unasgined checklist
	if (data.forms[0].id==0){
		var form=data.forms[0];
		jQuery( "#c3 .nav-pills" ).append( "<button class=nav-link id='li-f-"+form.id+"' data-bs-toggle='tab' data-bs-target='#f-"+form.id+"' data-toggle='tab' type='button' role='tab' aria-controls='nav-"+form.id+"'>"+form.name+"</button>" );
		jQuery( "#c3 .tab-content" ).append( "<div class='container tab-pane active show' id='f-"+form.id+"' role='tabpanel' aria-labelledby='li-f-"+form.id+"'></div>" );
		jQuery( "#f-" + form.id ).append( '\
		<div class="row">\
		<div class="form-group col-sm-12">\
		<p>These are all sightings which do not belong to any checklists. They won t be imported in eBird. If there is an error, you ll have to start again.</p>\
		<p>Click on the other menus to see the other checklists. </p>\
		</div>\
		<div class="form-group col-sm-12">\
		<div class="map" id="map-f-'+form.id+'"></div>\
		</div>\
		</div>\
		');
		form.map = L.map('map-f-'+form.id);
		form.layer = L.markerClusterGroup({
			showCoverageOnHover: false,
			maxClusterRadius:70,
		}).addTo(form.map);
		
		L.control.layers({
			'MapBox': L.tileLayer.provider('MapBox', {id: 'mapbox/streets-v11', accessToken:token.mapbox}).addTo(form.map),
			'Mapbox Sattelite' : L.tileLayer.provider('MapBox', {id: 'mapbox/satellite-v9', accessToken:token.mapbox}),
			'OpenStreetMap' : L.tileLayer.provider('OpenStreetMap.Mapnik'),
			'Swisstopo': new L.TileLayer('https://wmts10.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg', {
			layer: 'ch.swisstopo.pixelkarte-farbe-pk1000.noscale',
			maxZoom: 17,
			attribution: 'Map data &copy; 2015 swisstopo',
		})
	},null,{collapsed:true}).addTo(form.map);
	
	form.sightings.forEach(function(s,id) {
		var m = Makemarker(s);
		m.addTo(form.layer);
		if (id === form.sightings.length-1){
			form.map.fitBounds(form.layer.getBounds());
		}
	})
	data.forms.shift()
}

// Add true checklist
data.forms.forEach(function(form,idx){
	
	// Change the imported form structure to suit our need. First depending on if it's a 'legit' form or not and then for both.
	if ( form['@id']){ // Legit form
		form.date = moment(form.sightings[0].date['@ISO8601']).format('YYYY-MM-DD')
		var duration = moment.utc(moment(form.time_stop,"HH:mm").diff(moment(form.time_start,"HH:mm"))).format('HH:mm');
		form.duration = parseInt(duration.split(':')[0])*60+parseInt(duration.split(':')[1]);
		form.full_form= (form.full_form=='1') ? true : false;
		if (form.duration>0){
			form.protocol='Stationary';
		} else {
			form.protocol='Incidental';
		}
		
	} else { // form from incidental sighting
		var dates = form.sightings.map(function(s){ 
			return moment(s.date['@ISO8601']).format('YYYY-MM-DD')
		})
		form.date = dates.reduce(function(a, b){ return (a === b) ? a : ''; });
		if (!form.date){
			alert('Sigthings of form "' + form.name +'" do not come from the same day. We took the earliest date. Please, check if this is correct.')
			form.date = dates.sort((a,b) =>
			dates.filter(v => v===a).length
			- dates.filter(v => v===b).length
			).pop()
		}
		var times = form.sightings.map(function(s){ 
			return moment(s.date['@ISO8601']).format('HH:mm')
		}).filter(function(t){
			return t !='00:00'
		})
		if (times.length>0){
			form.time_start = times.reduce(function (a, b) { return moment(a,'HH:mm') < moment(b,'HH:mm') ? a : b; }); 
			form.time_stop = times.reduce(function (a, b) { return moment(a,'HH:mm') > moment(b,'HH:mm') ? a : b; }); 
			var duration = moment.utc(moment(form.time_stop,"HH:mm").diff(moment(form.time_start,"HH:mm"))).format('HH:mm');
			form.duration = parseInt(duration.split(':')[0])*60+parseInt(duration.split(':')[1]);
		} else {
			form.duration = '';
			form.time_start = '';
		}
		form.protocol='Incidental';
	}
	form.sightings.forEach(function(s){
		if(s.observers[0].estimation_code=='MINIMUM') {
			s.observers[0].estimation_code='>';
		} else if (s.observers[0].estimation_code=='EXACT_VALUE') {
			s.observers[0].estimation_code='=';
		} else if (s.observers[0].estimation_code=='ESTIMATION') {
			s.observers[0].estimation_code='~';
		} else if (s.observers[0].estimation_code=='NO_VALUE') {
			s.observers[0].estimation_code=''
			s.observers[0].count='x'
		}
		s.observers[0].coord_lat_str = deg_to_dms(s.observers[0].coord_lat);
		s.observers[0].coord_lon_str = deg_to_dms(s.observers[0].coord_lon);
		
		if (!s.observers[0].details){
			s.observers[0].details = '';
		} else {
			var details=[];
			s.observers[0].details.forEach(function(d){
				detail = d.count +'x ';
				if (d.sex["@id"]!='U'){
					detail += d.sex["#text"];
				}
				if (d.age["@id"]!='U'){
					detail += ' '+d.age["#text"];
				}
				details.push(detail)
			})
			s.observers[0].details = details.join(', ');
		}
		if (!s.observers[0].atlas_code){
			s.observers[0].atlas_code = '';
		} else {
			s.observers[0].atlas_code = atlas_code[s.observers[0].atlas_code['#text']] + '(Atlas code: '+s.observers[0].atlas_code['#text']+')';
		}
		
	})
	form.distance='';
	form['party-size']=jQuery('#nb-obs').val();
	form.staticmap={};
	form.gist='#';
	if (form.marker){
		form.lon=form.marker.getLatLng().lng;
		form.lat=form.marker.getLatLng().lat;
	}
	form.weather='';
	/*jQuery.get('https://api.wunderground.com/api/b097b9712f359043/history_'+moment(form.date).format('YYYYMMDD')+'/q/'+form.lat+','+form.lon+'.json',function(data){
		var w = data.history.dailysummary[0];
		form.weather= "";
		if (w) {
			var whtml= '<b>Temp.</b>:'+w.meantempm+'°C ('+w.mintempm+'/'+w.maxtempm +')';
			whtml += ' - <b>Prec.</b>: '+w.precipm+ 'mm';
			whtml += w.snow=='0' ? '':' (snow)'; 
			whtml += ' - <b>Wind</b>: '+w.meanwdire+' '+w.meanwindspdm+ 'km/h ('+w.minwspdm+'/'+w.maxwspdm+')';
			whtml += ' - <b>Humidity</b>: '+w.humidity;
			//whtml += w.fog ? 'fog':''; 
			//whtml += w.hail ? 'hail':''; 
			form.weather= whtml;
		}
		previewComment(form)
	})*/

	/*jQuery.getJSON('http://api.weatherstack.com/historical?access_key='+token.weatherstack+'&query='+form.lat+','+form.lon+'&hourly=1' ,function(weather){

		var id = moment((moment(data.forms[0].time_start,"HH:mm")+moment(data.forms[0].time_stop,"HH:mm:ss"))/2).add(30, 'minutes').startOf('hour').hour();
		var w = weather.forecast.forecastday[0].hour[id];

		if (w) {
			var whtml= '<b>Weather</b>:' +w.condition.text;
			whtml += ' <b>Temp.</b>:'+w.temp_c+'°C';
			whtml += ' - <b>Prec.</b>: '+w.precip_mm+ 'mm';
			whtml += w.chance_of_snow =='0' ? '':' (snow)'; 
			whtml += ' - <b>Cloud</b>: '+w.cloud+'%';
			whtml += ' - <b>Wind</b>: '+w.wind_dir+' '+w.wind_kph+ 'km/h';
			//whtml += ' - <b>Humidity</b>: '+w.humidity;
			whtml += ' - <b>Visibility</b>: '+w.vis_km+'km';				
			form.weather= whtml;
		}
		previewComment(form)
	})*/
	/*
	jQuery.getJSON( 'https://photon.komoot.de/reverse?lat='+form.lat.toString()+'&lon='+form.lon.toString() + '&limit=1', function( json ) {
		if (json.features.length>0){
			tmp = json.features[0].properties;	
			form.country = tmp.country;
			form.name = tmp.name +', '+ tmp.city +', '+ tmp.state + ' (' + (Math.round(form.lat*1000)/1000).toString()+', '+ (Math.round(form.lon*1000)/1000).toString() + ')';
			jQuery('#f-'+form.id+' .location').val(form.name);
			jQuery('#li-f-'+form.id+' a').html(form.name);
		}
	});
	jQuery.getJSON( 'https://eu1.locationiq.com/v1/reverse.php?key='+token.locationIQ+'&lat='+form.lat.toString()+'&lon='+form.lon.toString()+'&format=json', function( json ) {
		if (true){
			form.country = json.address.country;
			form.name = json.display_name;
			jQuery('#f-'+form.id+' .location').val(form.name);
			jQuery('#li-f-'+form.id+' a').html(form.name);
		}
	});
	*/
	form.name = mode(form.sightings.map(s => s.place.name))
	jQuery('#f-'+form.id+' .location').val(form.name);
	jQuery('#li-f-'+form.id+' a').html(form.name);


jQuery( "#c3 .nav-pills" ).append( "<button class=nav-link id='li-f-"+form.id+"' data-bs-toggle='tab' data-bs-target='#f-"+form.id+"' data-toggle='tab' type='button' role='tab' aria-controls='nav-"+form.id+"'>"+form.name+"</button>" );
jQuery( "#c3 .tab-content" ).append( "<div class='container tab-pane active show' id='f-"+form.id+"' role='tabpanel' aria-labelledby='li-f-"+form.id+"'></div>" );
jQuery( "#f-" + form.id ).append( '\
<form class="form" data-toggle="validator" >\
<div class="row">\
<div class="form-group col-lg-12 mb-2">\
<label for="location" class="control-label">Location:</label>\
<input type="text" class="form-control location" value="'+form.name+'" required>\
<div class="help-block with-errors"></div>\
</div>\
<div class="form-group mb-2 col-sm-12">\
<div class="map" id="map-f-'+form.id+'"></div>\
</div>\
<div class="form-group col-lg-6">\
<div class="row">\
<div class="form-group col-lg-6">\
<label class="control-label" for="date">Date:</label> \
<input type="date" class="form-control date" value="'+form.date+'" required>\
<div class="help-block with-errors"></div>\
</div>\
<div class="form-group col-lg-6">\
<label class="control-label" for="time">Time:</label>\
<input type="time" class="form-control time" value="'+form.time_start+'">\
<div class="help-block with-errors"></div>\
</div>\
</div>\
<div class="row">\
<div class="form-group col-lg-6">\
<label for="observation-type">Observation Type:</label>\
<select class="form-control observation-type" required>\
<option>Traveling</option>\
<option>Stationary</option>\
<option>Historical</option>\
<option>Incidental</option>\
</select>\
<div class="help-block with-errors"></div>\
</div>\
<div class="form-group col-lg-6">\
<label>Complete Checklist:</label>\
<div class="div-sliderOF">\
<div class="col text-right">NO</div>\
<div class="text-center">\
<label class="switch"><input type="checkbox" checked="checked" class="check-fullform"><div class="sliderOF round"></div></label>\
</div>\
<div class=" col text-left">YES</div>\
</div>\
</div>\
</div>\
<div class="row">\
<div class="form-group col-lg-4">\
<label class="control-label" for="duration">Duration ( min.):</label> \
<input type="number" class="form-control duration" value="'+parseInt(form.duration).toString()+'" min="0" step="5" max="1440" data-durationOK>\
<div class="help-block with-errors"></div>\
</div>\
<div class="form-group col-lg-4">\
<label class="control-label" for="distance">Distance (km):</label>\
<input type="number" class="form-control distance" value="'+form.distance+'" min="0" step=".1" max="999" data-distanceOK>\
<div class="help-block with-errors"></div>\
</div>\
<div class="form-group col-lg-4">\
<label class="control-label" for="party-size">Party size:</label>\
<input type="number" class="form-control party-size" value="'+form['party-size']+'" min="1" max="99" required>\
<div class="help-block with-errors"></div>\
</div>\
</div>\
<div class="form-group col-lg-12">\
<label for="cmt-sp-ct-bt-'+ form.id+'">Species Comment:</label>\
<div class="cmt-sp">\
<div class="cmt-sp-ct cmt-sp-ct-tp" id="cmt-sp-ct-tp-'+ form.id+'">\
<span class="badge bg-secondary" contenteditable="false" value="s.date.text">Timing (full)</span>\
<span class="badge bg-secondary" contenteditable="false" value="moment(s.date[\'@ISO8601\']).format(\'dd-MM-YYYY HH:mm\')">Timing (condensed)</span>\
<span class="badge bg-secondary" contenteditable="false" value="moment(s.date[\'@ISO8601\']).format(\'HH:mm\')">Time</span>\
<span class="badge bg-secondary" contenteditable="false" value="(s.observers[0].id_sighting || s.observers[0].id_universal)">ID sighting</span>\
<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].estimation_code">Estimation code</span>\
<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].count">Count</span>\
<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].coord_lat">Latitude DD</span>\
<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].coord_lon">Longitude DD</span>\
<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].coord_lat_str">Latitude DMS</span>\
<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].coord_lon_str">Longitude DMS</span>\
<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].comment">Comment</span>\
<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].details">Detail</span>\
<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].atlas_code">Atlas code</span>\
</div>\
<div class="cmt-sp-ct cmt-sp-ct-bt" id="cmt-sp-ct-bt-'+ form.id+'" contenteditable="true">'+
(jQuery('#incl-sp-cmt').is(":checked") ?
('<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].estimation_code">Estimation code</span>\
<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].count">Count</span> ind. - \
<span class="badge bg-secondary" contenteditable="false" value="moment(s.date[\'@ISO8601\']).format(\'HH:mm\')">Time</span> - \
&lt;a href="http://maps.google.com?q=<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].coord_lat">Latitude DD</span>,\
<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].coord_lon">Longitude DD</span>\
&t=k" target="_blank" &gt;<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].coord_lat_str">Latitude DMS</span>N, \
<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].coord_lon_str">Longitude DMS</span>E&lt;/a&gt;'+
(jQuery('#sel-website-link').val() =='birdlasser' ? '' : ' - &lt;a href="\
<span class="badge bg-secondary" contenteditable="false" value="s.link">link</span>\
" target="_blank">'+jQuery('#sel-website-link').val()+'&lt;/a&gt;') +
'<br>&lt;br&gt;<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].comment">Comment</span>\
<br>&lt;br&gt;<span class="badge bg-secondary" contenteditable="false" value="s.observers[0].details">Detail</span>') : '')
+'</div>\
</div>\
</div>\
<div class="form-group col-lg-12">\
<label>Exemple:  </label>\
<div class="form-group" style=" display: inline-block;">\
<select class="cmt-sp-preview-sp"></select>\
</div>\
<div class="cmt-sp-preview"></div>\
</div>\
</div>\
<div class="form-group col-lg-6">\
<div class="row">\
<label for="comments">Checklist Comment:</label>\
<textarea class="form-control comments" rows="3"  >'+(form.comment || "") +'</textarea>\
</div>\
<div class="row form-check">\
<label><input class="form-check-input check-static-map" type="checkbox" '+  (jQuery('#incl-map').is(":checked") ? 'checked="checked"' : '') +'> Include static map</label>\
</div>\
<div class="row">\
<div class="col-lg-5 form-inline">\
<label for="zoom">Zoom:</label>\
<span class="input-group-btn">\
<button type="button" class="btn btn-sm btn-number" data-type="minus">\
<i class="fa fa-minus" aria-hidden="true"></i>\
</button>\
</span>\
<input type="text" class="zoom form-control" input="number" value="1" min="1" max="21">\
<span class="input-group-btn">\
<button type="button" class="btn btn-sm btn-number" data-type="plus">\
<i class="fa fa-plus" aria-hidden="true"></i>\
</button>\
</span>\
</div>\
<div class="col-lg-3">\
<button type="button" class="btn btn-default center-block center-map" title="Set static map automaticaly with sightings location">Center map</button>\
</div>\
<div class="col-lg-4">\
<button type="button" class="btn btn-default center-block button-geojson">Export GeoJson</button>\
</div>\
</div>\
<div class="row form-check">\
<label><input type="checkbox" class="form-check-input check-weather" '+ (jQuery('#incl-weather').is(":checked") ? 'checked="checked"' : '') +'disabled> Include weather</label>\
</div>\
<div class="row">\
<label>Preview:</label>\
<div class="comments-preview"></div>\
</div>\
</div>\
</div>\
</div>\
</form>\
');



// Create Map
form.map = L.map('map-f-'+form.id, {keyboard: false});
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
	'MapBox': L.tileLayer.provider('MapBox', {id: 'mapbox/streets-v11', accessToken:token.mapbox}),
	'Mapbox Sattelite' : L.tileLayer.provider('MapBox', {id: 'mapbox/satellite-v9', accessToken:token.mapbox}).addTo(form.map),
	'OpenStreetMap' : L.tileLayer.provider('OpenStreetMap.Mapnik'),
	'Swisstopo': new L.TileLayer('https://wmts10.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg', {
	layer: 'ch.swisstopo.pixelkarte-farbe-pk1000.noscale',
	maxZoom: 17,
	attribution: 'Map data &copy; 2015 swisstopo',
})
},null,{collapsed:true}).addTo(form.map);
new L.Control.Draw({
	position: 'topright',
	draw: {
		polyline: { 
			shapeOptions: {
				color: '#ad8533',
				weight: 5,
				opacity: 1,
				dashArray: "20, 10, 10, 10"
			}
		},
		circlemarker: false,
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
		jQuery('#f-'+form.id+' .observation-type').val('Traveling')
		jQuery('#f-'+form.id+' .distance').val(jQuery(this).html())
		jQuery('#f-'+form.id+' .observation-type').change()
	});
	e.layer.bindPopup(popup[0]).openPopup();
	form.map.fitBounds(form.layer.sightings.getBounds());
	previewComment(form)
});

// Import Sightings
form.sightings.forEach(function(s,id) {
	s['marker-symbol'] = (s.observers[0].count < 99) ? s.observers[0].count : 'x';
	s['marker-color'] = color(s,form);
	s['marker-size'] = 'm';
	var m = Makemarker(s);
	m.addTo(form.layer.sightings);
	
	// when finish
	if (id === form.sightings.length-1){
		form.map.fitBounds(form.layer.all.getBounds());
		form.staticmap.lng = form.layer.sightings.getBounds().getCenter().lng;
		form.staticmap.lat = form.layer.sightings.getBounds().getCenter().lat;
		form.layer.msm = L.marker([form.staticmap.lat,form.staticmap.lng], {
			icon:L.icon({
				iconUrl: './assets/Maps-Center-Direction-icon.png',
				iconSize:     [40, 40],
				iconAnchor:   [20, 20], 
				popupAnchor:  [-20, 0]
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
		previewComment(form)
	}
})

var LatLngBounds = form.layer.all.getBounds();
var dist = LatLngBounds.getNorthEast().distanceTo(LatLngBounds.getSouthWest())/1000; // m -> km
dist = Math.max(5,Math.round(dist*2)).toString();

// Load local hotspot
jQuery.getJSON( 'https://ebird.org/ws2.0/ref/hotspot/geo?lat='+LatLngBounds.getCenter().lat+'&lng='+LatLngBounds.getCenter().lng+'&dist=10&fmt=json', function( hotspots ) {
hotspots = Array.isArray(hotspots) ? hotspots : [hotspots] 
hotspots.forEach(function(h){
	var mark = L.marker([h.lat,h.lng],{
		title: h.locName,
		alt: h.locName,
		icon: L.icon({
			iconUrl: "/assets/hotspot-icon-hotspot.png",
			iconAnchor: [15, 19],
			popupAnchor: [0, -19],
		})
	})
	var popup = jQuery('<div/>') 
	popup.html('\
	Set Location of the Checklist with the eBird hostpot:<br>\
	<button type="button" class="btn btn-default setLocation" title="Define as location of the checklist">'+h.locName+'</button><br>\
	<a href="https://ebird.org/ebird/hotspot/'+h.locId +'" target="_blank" title="See on eBird">View on eBird</a>');
	popup.on('click', '.setLocation', function() {
		form.name = jQuery(this).html();
		jQuery('#f-'+form.id+' .location').val(form.name);
		jQuery('#li-f-'+form.id+' a').html(form.name);
		form.lat = h.lat;
		form.lon = h.lng;
	form.map.closePopup();
});
mark.addTo(form.layer.hotspots).bindPopup(popup[0]);
})
form.map.fitBounds(form.layer.sightings.getBounds());
//form.map.invalidateSize();
});



// Add Listener
jQuery('#f-'+form.id+' .location').keyup( function(){ 
	form.name = jQuery(this).val();
	jQuery('#li-f-'+form.id+' a').html(form.name)
	if (!form.name){
		jQuery(this).parent().addClass('has-error');
	} else{
		jQuery(this).parent().removeClass('has-error');
	}
});
jQuery('#f-'+form.id+' .date').change( function(){ 
	form.date = jQuery(this).val();
	if (!form.date || !/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(form.date)  ){
		jQuery(this).parent().addClass('has-error');
	} else{
		jQuery(this).parent().removeClass('has-error');
	}
});
jQuery('#f-'+form.id+' .time').change( function(){ 
	form.time_start = jQuery(this).val();
	if (form.protocol == 'Stationary' || form.protocol == 'Traveling'){
		if (!form.time_start || !/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(form.time_start)){
			jQuery(this).parent().addClass('has-error');
		} else{
			jQuery(this).parent().removeClass('has-error');
		}
	} else {
		jQuery(this).parent().removeClass('has-error');
	}
});
jQuery('#f-'+form.id+' .observation-type').change( function(){ 
	form.protocol = jQuery(this).val();
	if (form.protocol == 'Incidental'){
		jQuery('#f-'+form.id+' .check-fullform').prop("checked",false)
		jQuery('#f-'+form.id+' .check-fullform').change();
	}
	jQuery('#f-'+form.id+' .time').change()
	jQuery('#f-'+form.id+' .duration').change();
	jQuery('#f-'+form.id+' .distance').change();
});
jQuery('#f-'+form.id+' .duration').change( function(){ 
	form.duration = jQuery(this).val();
	jQuery(this).parent().removeClass('has-error');
	if (form.protocol == 'Incidental'){
		jQuery(this).prop('disabled', true);
	} else {
		jQuery(this).prop('disabled', false);
	}
	if ( (form.protocol == 'Traveling' || form.protocol == 'Stationary') && (!form.duration || form.duration<=0) ){
		jQuery(this).parent().addClass('has-error');
	}
});
jQuery('#f-'+form.id+' .distance').change( function(){ 
	form.distance = jQuery(this).val();
	jQuery(this).parent().removeClass('has-error');
	if (form.protocol == 'Traveling' || form.protocol == 'Historical' ){
		jQuery(this).prop('disabled', false);
	} else{
		jQuery(this).prop('disabled', true);
	}
	if (form.protocol == 'Traveling' && (!form.distance || form.distance<=0)){
		jQuery(this).parent().addClass('has-error');
	}
});
jQuery('#f-'+form.id+' .party-size').change( function(){ 
	form['party-size'] = jQuery(this).val();
	if (!form['party-size'] || form['party-size']<1){
		jQuery(this).parent().addClass('has-error');
	} else{
		jQuery(this).parent().removeClass('has-error');
	}
});
jQuery('#f-'+form.id+' .check-fullform').change( function(){
	if (jQuery(this).is(':checked')){
		form.full_form = true
	} else{
		form.full_form = false
	}
})
jQuery('#f-'+form.id+' .observation-type').val(form.protocol).change();

if (form.full_form) {
	jQuery('#f-'+form.id+' .check-fullform').prop("checked")
} else {
	jQuery('#f-'+form.id+' .check-fullform').prop("checked",false)
}
jQuery('#f-'+form.id+' .comments').keyup( function(){
	previewComment(form);
});
jQuery('#f-'+form.id+' .check-static-map').change( function(){
	previewComment(form);
});
jQuery('#f-'+form.id+' .check-weather').change( function(){
	previewComment(form);
});
jQuery('#f-'+form.id+' .button-geojson').click( function(){
	var fs = form.layer.sightings.toGeoJSON();
	form.layer.edit.toGeoJSON().features.forEach(function(f){
		fs.features.push(f);
	})
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fs));
	var link = document.createElement("a");
	link.setAttribute("href",     dataStr     );
	link.setAttribute("download", form.name.replace(' ','_')+".json");
	document.body.appendChild(link);
	link.click();
})
dragula([document.getElementById('cmt-sp-ct-tp-'+ form.id), document.getElementById('cmt-sp-ct-bt-'+ form.id)], {
	copy: function (el, source) {
		return source === document.getElementById('cmt-sp-ct-tp-'+ form.id)
	},
	accepts: function (el, target) {
		return target !== document.getElementById('cmt-sp-ct-tp-'+ form.id)
	},
	removeOnSpill: true
});
form.sightings.forEach( function(s,id){
	jQuery('#f-'+form.id+' .cmt-sp-preview-sp').append(jQuery('<option>', {
		value: id,
		text: (s.species.name || s.species.bird_name)
	}));
})
jQuery('#f-'+form.id+' .center-map').click(function(){
	form.staticmap.lng = form.layer.sightings.getBounds().getCenter().lng;
	form.staticmap.lat = form.layer.sightings.getBounds().getCenter().lat;
	form.staticmap.zoom = getBoundsZoomLevel(L.featureGroup([form.layer.edit, form.layer.sightings]).getBounds(), { height: 450, width: 800 })
	form.layer.msm.setLatLng(form.layer.sightings.getBounds().getCenter());
	previewComment(form)
})

jQuery('#f-'+form.id+' .btn-number').click(function(e){
	var input = jQuery('#f-'+form.id+ ' .zoom');
	if(jQuery(this).attr('data-type') == 'minus') {
		input.val(+input.val()-1);
	} else if(jQuery(this).attr('data-type') == 'plus') {
		input.val(+input.val()+1);
	}
	input.change();
});
jQuery('#f-'+form.id+ ' .zoom').on('change', function() {
	var input = jQuery('#f-'+form.id+ ' .zoom');
	if(input.val() <= input.attr('min')) {
		jQuery(".btn-number[data-type='minus']").attr('disabled', true);
		input.val(input.attr('min'));
	} else {
		jQuery(".btn-number[data-type='minus']").attr('disabled', false);
	}
	if(input.val() >= input.attr('max')) {
		jQuery(".btn-number[data-type='plus']").attr('disabled', true);
		input.val(input.attr('max'));
	} else {
		jQuery(".btn-number[data-type='plus']").attr('disabled', false);
	}
	form.staticmap.zoom = input.val();
	previewComment(form);
})
jQuery('#f-'+form.id+ ' .zoom').val(form.staticmap.zoom);

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
jQuery('#f-'+form.id+' .cmt-sp-preview-sp').change( function(){
	previewSpComment(form);
});
})


// Activate only the first tab
setTimeout(function() {
jQuery('.tab-content .tab-pane').each( function(idx,item){
	var id = jQuery(item).attr('id');
	if (idx==0){
		jQuery('#'+id).addClass('active show')
		jQuery('#li-'+id).addClass('active')
	} else {
		jQuery('#'+id).removeClass('active show')
		jQuery('#li-'+id).removeClass('active')
	}
})
data.forms.forEach(function(form,idx){
	previewSpComment(form);
	previewComment(form)
})
},100)

/*
setTimeout(function() {
data.forms.forEach(function(form,idx){
	form.map.invalidateSize();
	form.map.fitBounds(form.layer.sightings.getBounds());
/*
	jQuery('#li-f-'+form.id).on('click',function(){
		
		setTimeout(function() {
			form.map.invalidateSize();
			console.log(form)
			form.map.fitBounds(form.layer.sightings.getBounds());
		},1);
	})
	previewSpComment(form);
	previewComment(form)
})
},100);
*/

}



















//____________________________________________________
//                EXPORT FUNCTIONS
//____________________________________________________

// Genreate table 
function Form2Table(f){
	table=[];
	alert_sp=[];
	f.sightings.forEach( function(s) {
		var eBird_bird = jQuery.grep(eBird_birds_list, function(e){ return e.id == s.species['@id'] })
		
		if (eBird_bird.length<1){
			alert_sp.push(s.species.name);
			eBird_bird.push([]);
			eBird_bird[0].PRIMARY_COM_NAME = s.species.name;
		}
		
		var row = {
			common_name: eBird_bird[0].PRIMARY_COM_NAME,
			genus:'',
			specie:'',
			count: s.observers[0].count,
			specie_comment:SpComment(f,s).replace(/"/g,'""').replace(/[\n\r]+/g, ''),
			location:f.name,
			lat:f.lat,
			lng:f.lon,
			date: moment(f.date).format('MM/DD/YYYY'),
			start_time: f.time_start,
			state:'',//s.place.county,
			country: '',//(s.place.country) ? s.place.country : 'CH',
			protocol: f.protocol,
			party_size: f['party-size'],
			duration:f.duration>0 ? f.duration : '',
			full_form: f.full_form ? 'Y' : 'N',
			distance: (f.distance*0.621371)>0 ? (f.distance*0.621371).toString() : '',
			area:'',
			form_comment:f.comment.replace(/"/g,'""').replace(/[\n\r]+/g, ''),
		};
		table.push(row)
	})
	
	/*if (alert_sp.length>0){
		alert('One or more specie(s) do(es) not exist in the current system. You might have more work on eBird to match these species. Please report the error at rafnuss@gmail.com. \n' + alert_sp.join(', ') )
	}*/
	
	// Check for duplicate
	var non_alert=true;
	table2 = table.reduce(function(accumulator, currentValue) { 
		var ind = accumulator.map(t => t.common_name).indexOf(currentValue.common_name)
		if (ind == -1){
			accumulator.push(currentValue);
		} else {
			accumulator[ind].count=(parseInt(accumulator[ind].count)+parseInt(currentValue.count)).toString();
			var tmp = accumulator[ind].specie_comment + currentValue.specie_comment;
			if (tmp.length > 4000){
				if (non_alert){
					alert('Species comment is too long. Please review the species comment template of '+ f.name+'. We will carry on the export triming the comments at 4000 characters. ')
					non_alert=false;
				}
			} else {
				accumulator[ind].specie_comment = tmp;
			}
		}
		return accumulator
	},[]);
	
	return table2;
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

function CreateGist(form, callback){
	if (jQuery("#incl-map-link").prop("checked")){
		var fs = form.layer.sightings.toGeoJSON();
		form.layer.edit.toGeoJSON().features.forEach(function(f){
			fs.features.push(f);
		})
		var filename= (form.name+'-'+form.date).replace(/[^a-z0-9_\-]/gi, '_').toLowerCase()+".geojson";
		var gist = {
			"description": form.name +", "+ form.date,
			"public": true,
			"files": {}
		}
		gist.files[filename] = { "content": JSON.stringify(fs) };
		jQuery.ajax({ 
			url: 'https://api.github.com/gists',
			type: 'POST',
			beforeSend: function(xhr) { 
				xhr.setRequestHeader("Authorization", "token "+jQuery('#github-token').val()); 
			},
			data: JSON.stringify(gist),
		}).done(function(response) {
			form.gist='https://zoziologie.raphaelnussbaumer.com/geojson/?'+encodeURIComponent(response.files[filename].raw_url)
			previewComment(form)
			callback()
		}).fail( function( jqXHR, textStatus, errorThrown) {
			alert('Error with the Gist Map: '+ errorThrown )
			previewComment(form)
			callback()
		});
	} else {
		callback()
	}
	
}

function singleExport(form){
	if (jQuery('#f-'+form.id + ' .form-group.has-error').length > 0) {
		alert('Form '+form.name+' has error(s). It will not be exported!')
	} else {
		jQuery('#button-download-biolovision-single > span.spinner-border.spinner-border-sm').show()
		CreateGist(form, function(){
			var table = Form2Table(form);
			csv = Table2CSV(table);
			var downloadLink = document.createElement("a");
			downloadLink.setAttribute('type','text/csv')
			downloadLink.setAttribute('target','_blank')
			var blob = new Blob(["\ufeff", csv],{type: 'text/csv'});
			downloadLink.href = URL.createObjectURL(blob);
			downloadLink.download = form.name.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase()+'-'+form.date+".csv";
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
			jQuery('#button-download-biolovision-single > span.spinner-border.spinner-border-sm').hide()
		})
	}
}

function Export(){
	var table=[];
	var filename ='';
	var i=0;
	data.forms.forEach( function(form,i) {
		if (jQuery('#f-'+form.id + ' .form-group.has-error').length > 0) {
			alert('Form '+form.name+' has error(s). It will not be exported!')
		} else {
			jQuery('#button-download-biolovision > span.spinner-border.spinner-border-sm').show()
			CreateGist(form, function(){
				i+=1;
				t = Form2Table(form);
				table = table.concat(t);
				filename += form.name + '_';
				setTimeout(function() {
					if (i == data.forms.length){
						csv = Table2CSV(table);
						var downloadLink = document.createElement("a");
						downloadLink.setAttribute('type','text/csv')
						downloadLink.setAttribute('target','_blank')
						var blob = new Blob(["\ufeff", csv],{type: 'text/csv'});
						downloadLink.href = URL.createObjectURL(blob);
						downloadLink.download = filename.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase().slice(0,50) +'-'+form.date+".csv";
						document.body.appendChild(downloadLink);
						downloadLink.click();
						document.body.removeChild(downloadLink);
						jQuery('#button-download-biolovision > span.spinner-border.spinner-border-sm').hide()
					}
				},1000)
			})
		}
	});
}






























//____________________________________________________
//                PAGE FUNCTIONS
//____________________________________________________

// Variable to put in workspace
var data, csv_content, code_list=[],eBird_label=[],table=[],modalmap,modalsLayer, modalfLayer, form;

jQuery(document).ready(function(){  
	
	/* Adapt default website based on url param*/
	var url = new URL(window.location.href);
	switch(url.searchParams.get('site')) {
		case 'it':
		jQuery('#sel-website').val('www.ornitho.it')
		break;
		case 'fr':
		jQuery('#sel-website').val('www.faune-france.org')
		break;
	}
	
	jQuery('#sel-website').on('input',function(e){
		jQuery("#sel-website-link").val(jQuery('#sel-website').val());
		if (jQuery('#sel-website').val()=='birdtrack'){
			jQuery("#incl-map").attr("disabled", true);
			jQuery("#incl-map").prop("checked", false );
			jQuery("#incl-sp-cmt").attr("disabled", true);
			jQuery("#incl-sp-cmt").prop("checked", false );
		}  else {
			jQuery("#incl-map").attr("disabled", false);
			jQuery("#incl-map").prop("checked", true );
			jQuery("#incl-sp-cmt").attr("disabled", false);
			jQuery("#incl-sp-cmt").prop("checked", true );
		}

		if (jQuery('#sel-website').val()=='birdlasser'){
			jQuery("#sel-website-link").attr("disabled", true);
		} else {
			jQuery("#sel-website-link").attr("disabled", false);
		}
	});
	
	jQuery('#incl-sp-cmt').change(function() {
		if(this.checked) {
			$("#website-link-div").slideDown();
		} else {
			$("#website-link-div").slideUp();
		}     
	});
	
	jQuery('#incl-map').change(function() {
		if(this.checked) {
			jQuery("#incl-map-link").attr("disabled", false);
		} else {
			jQuery("#incl-map-link").attr("disabled", true);
			$("#github-token-div").slideUp();
			$("#github-token").prop('required',false);
			jQuery("#incl-map-link").prop("checked", false );
		}     
	});

	jQuery('#incl-map-link').change(function() {
		if(this.checked) {
			$("#github-token-div").slideDown();
			$("#github-token").prop('required',true);
		} else {
			$("#github-token-div").slideUp();
			$("#github-token").prop('required',false);
		}     
	});
	
	
	/* c1: Download biolovision data*/  
	//Define daptepicker
	/*jQuery('#input-date-from').datetimepicker({
		format: 'DD.MM.YYYY',
		viewMode: 'years',
		defaultDate: new Date(),
		showTodayButton: true,
		sideBySide: true,
	})
	jQuery('#input-date-to').datetimepicker({
		format: 'DD.MM.YYYY',
		viewMode: 'years',
		defaultDate: new Date(),
		showTodayButton: true,
		sideBySide: true,
	})*/
	
	jQuery("#sel-website").keyup(function(e){if(e.keyCode == 13){downloadfx();}});
	jQuery("#date_ago").keyup(function(e){if(e.keyCode == 13){downloadfx();}});
	jQuery("#input-date-from").keyup(function(e){if(e.keyCode == 13){downloadfx();}});
	jQuery("#input-date-to").keyup(function(e){if(e.keyCode == 13){downloadfx();}});
	jQuery('#date_ago').on('focus',function(){
		jQuery('input[type="radio"][value="offset"]').click()
	})

	jQuery("#input-date-from").on('focus',function(e){
		jQuery('input[type="radio"][name="radio_date"]').prop("checked", true); 
	});
	jQuery("#input-date-to").on('focus',function(e){
		jQuery('input[type="radio"][name="radio_date"]').prop("checked", true); 
	});
	
	
	/* Upload file*/ 
	// Drag and drop
	$('#upload-submit').submit(function(e) {
		e.preventDefault();    
	  
		if ( jQuery("#incl-map-link").prop("checked") & jQuery('#github-token').val()==""){
			alert('Please, add a github token')
			return
		}

		/* Write Cookies*/
		var d = new Date();
		d.setTime(d.getTime() + (365*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		cookies_text.forEach(function(s){
			document.cookie= s + "=" + escape(jQuery('#'+s).val()) + ";" + expires + ";path=/";
		})
		cookies_check.forEach(function(s){
			document.cookie= s + "=" + escape(jQuery('#'+s).is(':checked')) + ";" + expires + ";path=/";
		})

		handleFile($('#upload').prop('files')[0])
	  
	  });



	/* Read Cookies*/
	cookies_text=['sel-website','date_ago','nb-obs','input-date-from','input-date-to','sel-website-link','github-token'];
	cookies_check=['incl-map','incl-sp-cmt','incl-map-link']; // 'incl-weather',
	cookies_text.forEach(function(s){
		var v =getCookieValue(s);
		if (!(v === "")){
			jQuery('#'+s).val(v);
		}
	})
	cookies_check.forEach(function(s){
		var v =getCookieValue(s);
		if (!(v === "")){
			jQuery('#'+s).prop("checked",v === 'true');
		}
	})
	
	
	
	/* c3: Result*/
	// Button to write to file
	jQuery('#button-download-biolovision').click( Export );
	jQuery('#button-download-biolovision-single').click(function(){
		var n = jQuery("#tab-checklists div.active")[0].id.split('-')[1]-1;
		singleExport(data.forms[n]);
	});
	
	// Map
	L.MakiMarkers.accessToken = token.mapbox;
	
	$("[data-toggle='tooltip']").tooltip();
	
});


function getCookieValue(a) {
	var b = document.cookie.match('(^|[^;]+)\\s*' + a + '\\s*=\\s*([^;]+)');
	return b ? b.pop() : '';
}