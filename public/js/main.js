$(function() {
	$('.green').each(function() {
		var value = parseFloat($(this).data('score'));
		$(this).slider({
			range: "min",
			min: 0,
			orientation: "horizontal",
			animate: true,
			max: 100,
			value: value,
			slide: refreshMySwatch,
			change: refreshMySwatch,
			create: function(ev, ui) {
				var alpha = (value + 30) / 100;
				if ($("body").hasClass("home")) {
					$(this).find(".ui-slider-range").css("background-color", "rgba(115,225,57," + alpha + ")");
				}
			},
			disabled: ($('body').hasClass('home') === false)
		});
	});
	var url = window.location.pathname,
		urlRegExp = new RegExp(url.replace(/\/$/, '') + "$"); //  regexp to deal with possible slash
	$('.nav a').each(function() {
		if (urlRegExp.test(this.href.replace(/\/$/, ''))) {
			$(this).addClass('active');

		}
	});

	$(".saveButton").click(function() {
		saveMyChoices();
	});
	$(".addNewItem").click(function() {
		console.log("addNew");
		$(".addNewFormHold").show(function() {
			$(this).find(".saveNewItem").click(function() {
				//saveNewItem();
			});
		});
	});
	window.plucki = {};
	window.plucki.myID = $(".id").attr('data-id');
});


function refreshMySwatch() {
	var $thisSlider = $(this);
	//console.log("  \n  #######  in refreshMySwatch  " + $thisSlider.attr('data-url'));
	var thisValue = $thisSlider.slider("value");
	//var thisValue = $thisSlider.slider('value', ui.value);
	var alpha = (thisValue + 30) / 100;
	thisValue += "";
	$thisSlider.find(".ui-slider-range").css("background-color", "rgba(115,225,57," + alpha + ")");
	$thisSlider.parent().find(".score-readout").html(thisValue);
	$thisSlider.attr('data-score', thisValue);
}

function saveNewItem() {
	var newItemName = $(".newitemname").val();
	console.log("newitemname");
	var output = JSON.stringify({
		new: newItemName
	});
	var turl = "/" + window.plucki.myID + '/newitem';
	$.ajax({
		url: turl,
		type: "POST",
		processData: false,
		contentType: 'application/json',
		data: output,
		complete: function() {
			console.log('process complete');
		},
		success: function(data) {
			console.log(data);
			console.log('process success');
			$(".savedResponseTextHolder").html("Item saved");
			window.location = "/" + window.plucki.myID ;
			$(".savedResponseTextHolder").fadeIn(500).delay(2000).fadeOut(500);

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('process error ' + jqXHR + " " + textStatus + " " + errorThrown);
		},
	});
}

function saveMyChoices() {
	//console.log("save");
	var itemArray = [];
	$(".green").each(function(index) {
		var tempObj = {};
		//console.log($(this).attr('data-url') + "  " + $(this).attr('data-score'));
		tempObj.url = $(this).attr('data-url');
		tempObj.score = $(this).attr('data-score');
		tempObj.name = $(this).parent().find("h6").html();
		//console.log("h6 " + $(this).parent().find("h6").html());
		itemArray.push(tempObj);
		tempObj = "";
	});
	///console.log(itemArray);
	var output = JSON.stringify({
		items: itemArray
	});
	//savedResponseTextHolder
	//console.log("JSON output is " + output);
	var turl = "/" + window.plucki.myID + '/updatevalues';
	$.ajax({
		url: turl,
		type: "POST",
		processData: false,
		contentType: 'application/json',
		data: output,
		complete: function() {
			//called when complete
			console.log('process complete');
		},
		success: function(data) {
			console.log(data);
			console.log('process success');
			$(".savedResponseTextHolder").html("Changes saved");
			$(".savedResponseTextHolder").fadeIn(500).delay(2000).fadeOut(500);

		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('process error ' + jqXHR + " " + textStatus + " " + errorThrown);
		},
	});
}