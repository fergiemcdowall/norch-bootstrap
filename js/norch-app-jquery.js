//only fires if the the typeahead onSelect function is not invoked
$('#searchbox').keypress(function(e) {
  if(e.which == 13) {
    window.location='#/search?q=' + this.value;
  }
});



