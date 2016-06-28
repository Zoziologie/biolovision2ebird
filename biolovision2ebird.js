var data;
var meta;
var ebr;
var str;

function getebr(){
    ebr={};
    jQuery('table :input').each( function(idx){
        ebr[this.id] = this.value; 
    });
}

function handleFiles(files) {
    var reader = new FileReader()
        reader.readAsText(files[0])
        reader.onload = function(evt){
            papaparse = Papa.parse(evt.target.result,{
                header: true,
            });
            data=papaparse.data;
            meta = papaparse.meta;
            str='';
            papaparse.data.forEach( function(d) { 
               jQuery.each(ebr, function(idx,val){
                   //d.DATE= d.DATE.replace(/\./g,'/')
                   if (val){
                       str=str+eval(val)+',';
                   } else if(val==""){
                    str=str+',';
                   }
               })
               str=str + "\n"
            });
            console.log(str)
            var downloadLink = document.createElement("a");
            var blob = new Blob(["\ufeff", str]);
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = "biolovision2eBird.csv";

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };
}


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
    dropbox = document.getElementById("dropbox");
    dropbox.addEventListener("dragenter", dragenter, false);
    dropbox.addEventListener("dragover", dragover, false);
    dropbox.addEventListener("drop", drop, false);

    jQuery("#btn-show").click(function() {
        jQuery("#div-ebird-col").toggleClass('hidden');
    });
    jQuery("#div-ebird-col").toggleClass('hidden');

    getebr();

});
