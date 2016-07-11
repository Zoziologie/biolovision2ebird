var eBird_birds_list;
jQuery.getJSON("http://zoziologie.raphaelnussbaumer.com/wp-content/plugins/biolovision2eBird/patch_ornitho2eBird.json", function(data){
    eBird_birds_list = data;
});

// Variable to put in workspace
var data, meta, csv_content, d, matchCode, reader, code_list=[],eBird_label=[],table=[];

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
                    table[i]['Species Comments']+='<br><br>'+table[j]['Species Comments']
                        table[i]['Number']=(parseInt(table[i]['Number'])+parseInt(table[j]['Number'])).toString()

                        // Remove the element
                        table.splice(j,1);

                }
            }
        }
        console.log(s)
            if (!s) return;



        // write the file
        csv_content = ConvertToCSV(JSON.stringify(table));

        // create and open file and link
        var downloadLink = document.createElement("a");
        var blob = new Blob(["\ufeff", csv_content]);
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = d.DATE_YEAR+d.DATE_MONTH+d.DATE_DAY+'_'+d.PLACE.replace(/\ /g,'_')+".csv";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };
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
    jQuery('#specified-date').onclick=function(){
        window.open("http://www.ornitho.ch/index.php?m_id=97&sp_DChoice=range&sp_DFrom="+jQuery('#input-date-from').val()+"&sp_DTo="+jQuery('#input-date-to').val()+"&sp_SChoice=all&sp_PChoice=all&sp_OnlyMyData=1&sp_FChoice=export&sp_FExportFormat=TXT")
    };
    

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
});
