var eBird_birds_list;
jQuery.getJSON("http://zoziologie.raphaelnussbaumer.com/wp-content/plugins/biolovision2eBird/patch_ornitho2eBird.json", function(data){
    eBird_birds_list = data;
});

// Variable to put in workspace
var data, meta, csv_content, d, matchCode, reader, code_list=[],eBird_label=[],table=[],points=[],map;


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

        // put data in the workspace for debug
        d = data[0];

        // export JSON
        if (document.getElementById("geojson").checked){
            data.forEach(function(d) {
                var point = {
                "type": "Feature",
                "properties": {
                "title": d.PRECISION+d.TOTAL_COUNT+' '+d.NAME_SPECIES,
                "description": '<b>Date:</b> '+d.DATE+' '+d.TIMING + '<br><b>Specie:</b> '+d.NAME_SPECIES +'(<i>'+d.LATIN_SPECIES+'</i>)<br>'+'<b>Place:</b> '+d.PLACE+' / '+d.MUNICIPALITY+' ('+d.COUNTY+') - '+d.ALTITUDE+'m<br><b>Observation:</b> '+ d.PRECISION + d.TOTAL_COUNT + ' ind. (atlas code:'+d.ATLAS_CODE+') '+ '<br>ID: <a href="http://www.'+ jQuery('#sel-website').val() +'/index.php?m_id=54&id='+d.ID_SIGHTING+'">'+d.ID_SIGHTING+'</a>' ,
                "marker-size": "medium",
                "marker-symbol": "",
                "marker-color": "7e7e7e",
                },
                "geometry": {
                    "type": "Point",
                "coordinates": [parseFloat(d.COORD_LON),parseFloat(d.COORD_LAT)]
                }
                };
                points.push(point);
            });
            geojsonFeature = {
                "type": "FeatureCollection",
                "features": points
            };

            jQuery('#mapid').css('display','block')
                var geojsonLayer =  L.geoJson(geojsonFeature,{
                    onEachFeature: function(feature, layer){
                        layer.bindPopup(feature.properties.description);
                    }
                }).addTo(map);
            map.fitBounds(geojsonLayer.getBounds());


            var downloadLink = document.createElement("a");
            downloadLink.text='Download Data (GeoJson)';
            var blob = new Blob([JSON.stringify(geojsonFeature, null, 2)], {type: "application/json"});
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = d.DATE_YEAR+d.DATE_MONTH+d.DATE_DAY+'_'+d.PLACE.replace(/\ /g,'_')+".geojson";
            jQuery(downloadLink).insertAfter("#mapid");
        }
    };
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
});
