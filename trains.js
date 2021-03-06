window.addEventListener("load", function() {
	var selected = null;
	
	var leftPress = null;
	var centrePress = null;
	var rightPress = null;
	var arrowUp = null;
	var arrowDown = null;
	
	var crs = getUrlParameter("crs");
	crs = crs.replace(".","/to/");
	
	var codeRemap = function(code){
		switch(code){
			case "GR":
				return "LN";
				break;
			case "AW":
				return "TW";
				break;
			case "VT":
				return "WC";
				break;
			case "XR":
				return "TF";
				break;
			default:
				return code;
		}
	}
	
	console.log("getting departures for " + crs);
	$.ajax(api_url + "/departures/" + crs + "/25?accessToken=" + api_token)
	.done(function(resp) {
		if(resp.filtercrs){
			$("#dep-for").text(resp.locationName + " (" + resp.crs + ") to " + resp.filterLocationName + " (" + resp.filtercrs + ")");
		} else {
			$("#dep-for").text(resp.locationName + " (" + resp.crs + ")");
		}
		console.log(resp);
		$("#results tbody").empty();
		selected = null;
		if (resp.trainServices && resp.trainServices.length > 0) {
			resp.trainServices.forEach(function (train, index) {
				var trainStr = "<tr class='train" + ( train.etd != "On time" ? " late" : "" ) + "'><td>" + train.std + "</td><td><div>" + train.destination[0].locationName
				trainStr += train.destination[1] ? " and others" : "";
				trainStr += train.destination[0].via ? "<span class='via'> v " + train.destination[0].via.slice(4) + "</span>" : "";
				trainStr += "<span class='operator " + train.operatorCode + "'>" + codeRemap(train.operatorCode) + "</span>";
				trainStr += "<span class='platform'>" 
				trainStr += train.platform ? train.platform : "";
				trainStr += "</span></div></td>";
				if(train.isCancelled){
					trainStr += "<td>cancelled</td></tr>";
				} else {
					trainStr += "<td>" + processTime(train.etd) + "</td></tr>";
				}
				$("#results tbody").append(trainStr);
				$("#results tbody tr:last-child").attr("data-trainId",train.serviceIdUrlSafe);
			});
			
			selected = $($("#results tr")[0]).attr("data-selected","true");
			
		} else {
			$("#results tbody").append("<p>There are no departures from this station</p>");
		}
		$("#results-page .page-container").scrollTop(0);
	})
	.fail(function(data) {
		console.log("request failed");
		console.log(data);
		alert(crs + " is not a valid CRS code");
		window.location.href = 'index.html';
	})
	.always(function() {
	});
	
	arrowUp = function() {
		console.log("arrow up");
		if(selected.prev().is("tr")){
			selected.attr("data-selected","false");
			selected = selected.prev().attr("data-selected","true");
			console.log(selected.offset().top - $(window).scrollTop());
			console.log(selected.outerHeight());
			if(selected.offset().top - $(window).scrollTop() < 30){
				console.log(- selected.outerHeight() + $(window).scrollTop());
				$(window).scrollTop( - selected.outerHeight() + $(window).scrollTop() );
			}
		}
	}
	arrowDown = function() {
		console.log("arrow down");
		if(selected.next().is("tr")){
			selected.attr("data-selected","false");
			selected = selected.next().attr("data-selected","true");
			console.log(selected.offset().top - $(window).scrollTop());
			console.log(selected.outerHeight());
			if(selected.offset().top - $(window).scrollTop() > 200){
				console.log(selected.outerHeight() + $(window).scrollTop());
				$(window).scrollTop( selected.outerHeight() + $(window).scrollTop()	);
			}
		}
	}
	
	$(document).keypress(function(e){
		console.log(e.key);
		switch(e.key){
			case "SoftRight":
			case "Shift":
				location.reload();
				break;
			case "SoftLeft":
			case "Control":
				window.location.href = 'index.html';
				break;
			
			case "ArrowDown":
			case "]":
				arrowDown();
				e.preventDefault();
				break;
				
			case "ArrowUp":
				arrowUp();
				e.preventDefault();
				break;
			case "Enter":
				console.log("enter")
				window.location.href = "details.html?id=" + selected.attr("data-trainId");
				e.preventDefault();
				break;
				
		}
	});
});
