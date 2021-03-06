window.addEventListener("load", function() {
	var selected = null;
	
	var id = getUrlParameter("id");
				
	$.ajax(api_url + "/service/" + id + "?accessToken=" + api_token)
	.done(function(resp){
		console.log(resp);
		$("#calling tbody").empty();
			
		if(resp.previousCallingPoints){
			resp.previousCallingPoints[0].callingPoint.forEach(function (point, index) {
				var plat = point.platform ? point.platform : "";
				console.log(point.st);
				console.log(point.et);
				console.log(point.at);
				console.log("\n");
				if(point.at){
					$("#calling tbody").append("<tr class='train ontime passed" + ( point.at != "On time" ? " late" : "" ) + "'><td>" + processTime(point.st) + "</td><td><div>" + point.locationName + "<span class='platform'>" + plat + "</span><div></td><td>" + processTime(point.at) + "</td></tr>");
				} else {
					$("#calling tbody").append("<tr class='train ontime to-pass" + ( point.et != "On time" ? " late" : "" ) + "'><td>" + processTime(point.st) + "</td><td><div>" + point.locationName + "<span class='platform'>" + plat + "</span><div></td><td>" + processTime(point.et) + "</td></tr>");
				}
			});
		}
		
		if(resp.isCancelled){
			$("#calling tbody").append("<tr class='cancel'><td colspan=3>" + resp.cancelReason + "</td></tr>");
		} else if(resp.delayReason) {
			$("#calling tbody").append("<tr class='cancel'><td colspan=3>" + resp.delayReason + "</td></tr>");
		}
		var scrollTo = 0;
		if($("#calling tbody tr").length){
			scrollTo = $("#calling tbody tr").last().offset().top;
		}
		var etd = resp.etd ? processTime(resp.etd) : processTime(resp.atd);
		$("#calling tbody").append("<tr class='train ontime actual" + ( resp.atd == resp.std || etd == "on" ? "" : " late" ) + "'><td>" + resp.std + "</td><td><div>" + resp.locationName + "<div></td><td>" + etd + "</td></tr>");
		
		if(resp.subsequentCallingPoints.length > 1){
			var maxlength=0;
			resp.subsequentCallingPoints.forEach(function(points, index){
				if(points.callingPoint.length > maxlength){
					maxlength = points.callingPoint.length;
				}
			});
			var dest1 = [];
			resp.subsequentCallingPoints[0].callingPoint.forEach(function(point,index){
				dest1.push(point.crs);
			});
			var startAt = [0];
			resp.subsequentCallingPoints.slice(1).forEach(function(p, index){ // for each set that isn't the first
				loc = dest1.indexOf(p.callingPoint[0].crs)
				num = loc == -1 ? 0 : loc;
				for(var i=0; i<num; i++){
					p.callingPoint.unshift({});
				}
			});
			console.log(resp.subsequentCallingPoints);
			
			for(var i=0; i<maxlength; i++){
				console.log(i);
				$("#calling-mult").append("<tr class='mult-train sta upcoming'></tr>");
				var tr = $("#calling-mult tr").last();
				console.log(tr);
				
				
				var points = [];
				var crs1 = '';
				resp.subsequentCallingPoints.forEach(function(p, index){
					point = p.callingPoint[i];
					if(point === undefined){
						points.push(undefined); // this is for the empty bits at the bottom
					} else {
						if(crs1 == point.crs) {
						} else {
							crs1 = point.crs;
							if(jQuery.isEmptyObject(point)){ // one of the {}s we iserted earlier
								console.log("{}sd");
							} else {
								console.log(point);
								points.push(point);
							}
						}
					}
				});
				
				console.log(points);
				
				if(points.length === 1){
					console.log("points1");
					point = points[0];
					
					var et = point.et ? processTime(point.et) : processTime(point.at);
					tr.append("<td>" + processTime(point.st) + "</td><td class='sta' colspan=2>" + point.locationName + "</td><td>" + et + "</td>");
					// one row at start
				} else {
					
					resp.subsequentCallingPoints.forEach(function(p, index){
						point = p.callingPoint[i];
						if(point){
							tr.append("<td class='sta' colspan=2>" + point.locationName + "</td>");
						} else {
							tr.append("<td class='sta null' colspan=2></td>");
						}
					});
					$("#calling-mult").append("<tr class='mult-train times upcoming'></tr>");
					tr = $("#calling-mult tr").last();
				
						
					resp.subsequentCallingPoints.forEach(function(p, index){
						point = p.callingPoint[i];
						if(point){
							var et = point.et ? processTime(point.et) : 'fix';
							tr.append("<td class='times'>" + processTime(point.st) + "</td><td class='times'>" + et + "</td>");
						} else {
							tr.append("<td class='times null'></td><td class='times null'></td>");
						}
					});
				}
			}
			$("#calling-mult").addClass("active");
		} else {
			resp.subsequentCallingPoints[0].callingPoint.forEach(function (point, index) {
				$("#calling tbody").append("<tr class='upcoming" + ( point.et != "On time" ? " late" : "" ) + "'><td>" + processTime(point.st) + "</td><td><div>" + point.locationName + "<div></td><td>" + processTime(point.et) + "</td></tr>");
				$("#calling").addClass("active");
			});
		}
		
		var length = resp.length ? "Formed of " + resp.length.toString() + " carriages<br />" : "";
		$("table.active tbody").append("<tr class='cancel'><td colspan=3>" + length + "Operated by " + resp.operator + "</td></tr>");
		
		$(window).scrollTop(scrollTo);
	});
	
	$(document).keypress(function(e){
		console.log(e.key);
		switch(e.key){
			case "SoftRight":
			case "Shift":
				location.reload();
				break;
			case "SoftLeft":
			case "Control":
				window.history.back()
				break;
			
			/*case "ArrowDown":
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
				*/
		}
	});
});