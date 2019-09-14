
// Status
var levels = 0;
var correct = 0;
var incorrect = 0;
var points = 0;
var extrapoints = 0;

// Timing
var starttime = 0;
var endtime = 0;
var runtime = 0;
var clockupdate;
var paintclockupdates;

// Word timing
var wordstarttime = 0;
var wordruntime = 0;
var wordtimer;
var paintwordtimer;
var maxwordtime = 4000;

// Words
// var words = ["main", "come", "hello", "world", "hello", "world", "hello", "world"];
var newwords = [];
var currentword = 0;
var thisletters = [];
var nowletter = "";
var currentindex = 0;

// Others
var allowwrong = true;
var otherkeydown = false;
var isplaying = false;
var menuopen = true;
var currentmenu = 0;

var signedin = false;
var usercredentials = {
	name: "",
	givenname: "",
	familyname: "",
	type: "googleplus",
	token: "",
	profileimage: "",
	games: [
	/*
		{
			timestamp: 0,
			points: 0,
			levels: 0,
			correct: 0,
			incorrect: 0,
			timetaken: 0
		}
	*/
	]
};
var encouragingwords = ["awesome!", "great!", "wow!", "good!", "cool!"];

// Localstorage
// console.log(JSON.parse(localStorage["usercredentials"]));

try {
	console.log('localStorage available! ');
	usercredentials = JSON.parse(localStorage["usercredentials"]);
}
catch (e) {
	console.log('localStorage unavailable. ');
}
function saveLocal() {
	console.log('localStorage save! ');
	localStorage["usercredentials"] = JSON.stringify(usercredentials);
	drawMyChart();
}


// Helpers 
// var pfx = ["webkit", "moz", "MS", "o", ""];
// function PrefixedEvent(element, type, callback) {
// 	for (var p = 0; p < pfx.length; p++) {
// 		if (!pfx[p]) type = type.toLowerCase();
// 		element.addEventListener(pfx[p]+type, callback, false);
// 	}
// }

// Tools
function showPopup(str, fadeout, delayclose) {
	$("#status span").html(str);
	$("#status").fadeIn(750);
	$(".loadingdots").addClass("showloadingdots");
	if (fadeout) {
		$(".loadingdots").removeClass("showloadingdots");
		$("#status").fadeIn(250);
		setTimeout(function() {
			$("#status").fadeOut(750);
		}, delayclose || 500);
	}
}
function injectRemark(text, spanclass) {
	var remspan = $("<span>").html(text).addClass(spanclass);
	$("#remarksh").append(remspan);
	remspan.on("webkitAnimationEnd", function() {
		$(remspan).remove();
	});
}
function showEncouragement() {
	setTimeout(function() {
		if (Math.floor(Math.random() + 0.25)) {
			var encouragingwordsindex = Math.floor(Math.random() * (encouragingwords.length - 1) + 0.5);
			injectRemark(encouragingwords[encouragingwordsindex]);
		}
	}, 2000);
}
function humanNumber(number) {
	var num = Math.floor(number + 0.5);
	var ret = "";
    var start = num.toString().length;
	// snippet from http://labs.vectorform.com/2011/08/large-number-aesthetics-in-javascript/
	for (i = start; i > 0; i-=3, num = Math.floor(num / 1000)) {
        var prepend = num.toString();
        // Grab trailing three digits
        prepend = prepend.substr(i-3 < 0 ? 0 : i-3, i)
        // Include a comma only if this isn't our first time through
        if(i != start) {
            prepend += ' ';
        }
        ret = prepend + ret;
    }
    return ret;
}
function addPoints(pts, delay) {
	extrapoints += pts;
	var ptsclass = "";
	var ptsstr = humanNumber(pts);
	if (pts < 0) {
		ptsclass = "red";
	}
	else {
		ptsstr = "+" + ptsstr;
	}
	setTimeout(function() {
		injectRemark(ptsstr, ptsclass);
	}, delay);
}

// Timing
function addz(number) {
	newstr = number + "";
	if (newstr.length == 1) {
		newstr = "0" + newstr;
	}
	return newstr;
}
function clockframe() {
	now = new Date().getTime();
	runtime = now - starttime;
	/*
	min = Math.floor(runtime/10/100/60);
	sec = Math.floor(runtime/10/100);
	milsec = Math.floor(runtime/10);
	$("#timems").html(addz(milsec % 100));
	$("#times").html(addz(sec % 60));
	$("#timem").html(addz(min));
	*/
}
function paintclockframe() {
	var frametimes = getRunningTime();
	$("#timems").html(addz(frametimes[2]));
	$("#times").html(addz(frametimes[1]));
	$("#timem").html(addz(frametimes[0]));
}
function getRunningTime() {
	return [
	Math.floor(runtime/10/100/60),
	Math.floor(runtime/10/100) % 60,
	Math.floor(runtime/10) % 100];
}
function timerStart() {
	if (starttime == 0) {
		starttime = new Date().getTime();
	}
	starttime = new Date().getTime() - runtime;
	clockupdate = setInterval(clockframe, 0);
	paintclockupdate = setInterval(paintclockframe, 13);
	started = 1;
}
function timerStop() {
	clearInterval(clockupdate);
	clearInterval(paintclockupdate);
	started = 0;
}
function showNext() {
	showEncouragement();
	$(".maindone").remove();
	$(".main").removeClass("main").addClass("maindone");
	$(".maincome").removeClass("maincome").addClass("main");
	$("#words").children().each(function (index) {
		var thisclass = $(this).attr("class");
		$(this).removeClass().addClass("w" + (
			thisclass.replace("w", "") * 1 - 1
			));
	});
	$(".w0").remove();
}
function wordTimerStart() {
	wordstarttime = new Date().getTime();
	wordtimer = setInterval(wordTimerFrame, 0);
	paintwordtimer = setInterval(paintWordTimerFrame, 17);
}
function wordTimerStop() {
	clearInterval(wordtimer);
	clearInterval(paintwordtimer);
	if (allowwrong) {

		// POINTS
		var pointstoadd = (wordruntime / maxwordtime * - 100 + 75 ) * (levels-1);
		addPoints(pointstoadd, 750);


	}
}
function wordTimerFrame() {
	wordruntime = new Date().getTime() - wordstarttime;
	// MOVED TO paintWordTimerFrame();
	// $(".timespent").css("width", (wordruntime / maxwordtime * 100) + "%");
	// document.getElementById("timespent").style.width = (wordruntime / maxwordtime * 100) + "%";
	// $(".timespent").attr("data-left", (wordruntime / maxwordtime * 100) + "%");
	if (wordruntime >= maxwordtime) {
		exceedTime();
		updateData();
	}
}
function paintWordTimerFrame() {
	document.getElementById("timespent").style.width = (wordruntime / maxwordtime * 100) + "%";
}
function updateData() {
	levels = newwords[currentword].length;
	// points = Math.floor(correct * levels * 20 - incorrect * levels * 100 + 0.5 + extrapoints);
	// points = Math.floor(incorrect * levels * 100 + 0.5 + extrapoints);
	points = Math.floor(extrapoints);
	$("#correct").html(humanNumber(correct));
	$("#incorrect").html(humanNumber(incorrect));
	$("#levels").html(levels);
	$("#points").html(humanNumber(points));
}
function insertSpans() {
	var ele = ".main";
	// thisletters = $(ele).html();
	var spans = [];
	for (i = 0; i < thisletters.length; i++) {
		spans.push("<span>" + thisletters[i] + "</span>");
	};
	spans = spans.join("");
	$(ele).html(spans);
}
function exceedTime() {
	endGame("exceed");
}
function nextWord(letterwascorrect) {

	// CORRECT WORD
	correct++;

	currentword++;
	if (newwords[currentword]) {
		thisletters = newwords[currentword].split("");
		nowletter = thisletters[0];
		showNext();
		insertSpans();
		updateWords();
		currentindex = 0;
	}
	else {
		showNext();
		noMoreWords();
	}
	if (letterwascorrect) {

		// POINTS
		addPoints(80 * (levels-1));


		wordTimerStop();
		wordTimerStart();
	}
	else {

		// POINTS
		addPoints(-80 * (levels-1));


	}
	updateData();
}
$(document).keydown(function(e) {
	if (e.which == keycodes.KEYMAP["ESC"] && isplaying) {
		showMenu();
		endGame();
		e.preventDefault();
		// continue;
	}
	if (!menuopen && runtime == 0 && e.which <= keycodes.KEYCODES["z"] && e.which >= keycodes.KEYCODES["0"]) {
		timerStart();
		wordTimerStart();
		$("#wordsh > div.timespenth").fadeIn();
	}
	if (isplaying) {
		if (keycodes.KEYCODES[nowletter] == e.which) {
			e.preventDefault();
			$(".main span:nth-child(" + (currentindex + 1) + ")").addClass("green");
			nowletter = thisletters[currentindex + 1];

			// CORRECT LETTER
			//correct++;

			currentindex++;
			updateData();
			allowwrong = true;
			if (nowletter == thisletters[-1]) {
				nextWord(true);
			}
		}
		else if (e.which == keycodes.KEYMAP.BACKSPACE) {
			e.preventDefault();
		}
		else if (allowwrong && e.which <= keycodes.KEYCODES["z"] && e.which >= keycodes.KEYCODES["a"] && !otherkeydown) {
			e.preventDefault();
			$(".main span:nth-child(" + (thisletters.indexOf(nowletter) + 1) + ")").addClass("red");
			$("#mainword").addClass("red");
			incorrect++;
			updateData();
			nextWord(false);
			allowwrong = false;
			setTimeout(function () {
				$(".main span").removeClass("red");
				$("#mainword").removeClass("red");
			}, 200);
			setTimeout(function () {
				allowwrong = true;
			}, 1500);
		}
		else {
			otherkeydown = true;
		}
	}
});
$(document).keyup(function(e) {
	if (!(keycodes.KEYCODES[nowletter] == e.which) && !(e.which <= 90 && e.which >= 65 && !otherkeydown)) {
		otherkeydown = false;
	}
});
function updateWords() {
	if (newwords[currentword + 1]) {
		$("#mainword").append('<span class="maincome">' + newwords[currentword + 1] + '</span>');
	}
	if (newwords[currentword + 5]) {
		$("#words").append('<span class="w10">' + newwords[currentword + 5] + '</span>');
	}
}
function noMoreWords() {
	endGame("nowords");
	// say smt that we ran out 
}
function injectInitialWords() {
	$("#mainword").html("");
	$("#words").html("");
	$("#mainword").append('<span class="main">' + newwords[0] + '</span>');
	$("#mainword").append('<span class="maincome">' + newwords[1] + '</span>');
	for (i = 0; i < 6; i++) {
		$("#words").append('<span class="w' + (i + 5) + '">' + newwords[i] + '</span>');
	}
}
function sortWords() {
	newwords = [];
	for (i = 0; i < words.length; i++) {
		if (Math.floor(Math.random() + 0.05) > 0) { //  + 0.5
			newwords.push(words[i]);
		}
	}
	newwords.sort(function(a, b){
		return a.length - b.length;
	});
	// newwords[0] = "deadmau5";
	nowletter = newwords[0][0];
}
function updateGameData() {
	usercredentials.games.push({
		timestamp: new Date().getTime(),
		points: points,
		levels: levels,
		correct: correct, 
		incorrect: incorrect,
		timetaken: getRunningTime()
	});
}
function endGame(reason) {
	timerStop();
	wordTimerStop();
	$("#resultpoints").html(humanNumber(points));


	// Setup google plus share
	/*
	var gplusshareoptions = {
	  contenturl: 'http://typega.me/',
	  contentdeeplinkid: '/',
	  clientid: '519814078940.apps.googleusercontent.com',
	  cookiepolicy: 'single_host_origin',
	  prefilltext: 'Beat my score of ' + points + ' points! ',
	  calltoactionlabel: 'PLAY',
	  calltoactionurl: 'http://typega.me/',
	  calltoactiondeeplinkid: '/'
	};
	gapi.interactivepost.render('sharegoogleplus', gplusshareoptions);
	*/


	$("#results").fadeIn();
	isplaying = false;
	$("#wordsh > div.timespenth").fadeOut();
	updateGameData();
	if (reason == "nowords") {
		showPopup("wow! we ran out of words for you! ", true);
	}
	saveLocal();
}
function showMenu() {
	// UX
	$("body").addClass("menuopen");
	$("#stats").fadeOut();
	$("#menu").fadeIn();
	$("#play").fadeIn();
	menuopen = true;
}
function hideMenu() {
	// UX
	$("body").removeClass("menuopen");
	$("#stats").fadeIn();
	$("#menu").fadeOut();
	$("#play").fadeOut();
	menuopen = false;
}

// Charting

function getRelativeTime(timestamp) {
	var now = new Date();
	var date = new Date(timestamp);
	var diff = now - date;
	return Math.floor( diff / 1000 / 60 ) + " min ago";
	/*
	if ( !diff.getFullYear() && !diff.getMonth() && !diff.getDate() && !diff.getHours() && !diff.getMinutes() ) {
		return diff.getSeconds() + " seconds ago. ";
	}
	else if ( !diff.getFullYear() && !diff.getMonth() && !diff.getDate() && !diff.getHours() ) {
		return diff.getMinutes() + " minutes ago. ";
	}
	else if ( !diff.getFullYear() && !diff.getMonth() && !diff.getDate() ) {
		return diff.getHours() + " hours ago. ";
	}
	else if ( !diff.getFullYear() && !diff.getMonth() ) {
		return diff.getDate() + " days ago. ";
	}
	else {
		return (diff.getFullYear() * 12 + diff.getMonth()) + " months ago. ";
	}
	*/
}

function drawMyChart() {
	var data = {
		labels: [],
		datasets: [
			{
				fillColor: "rgba(235, 0, 255, 0.5)",
				strokeColor: "rgba(235, 0, 255, 0.75)",
				pointColor: "rgba(235, 0, 255, 1)",
				pointStrokeColor: "rgba(235, 0, 255, 0)",
				data: []
			}
		]
	}
	$("#mygamestable").empty();
	for (i = 0; i < usercredentials.games.length; i++) {
		data.labels.push("");
		data.datasets[0].data.push(usercredentials.games[i].points);
		$("#mygamestable").append("<tr><td>" + usercredentials.games[i].points + "</td><td>" + usercredentials.games[i].incorrect + "</td><td>" + usercredentials.games[i].timetaken[0] + ":" + usercredentials.games[i].timetaken[1] + "<sub>" + usercredentials.games[i].timetaken[2] + "</sub></td><td>" + getRelativeTime(usercredentials.games[i].timestamp) + "</td></tr>")
	}
	var ctx = $("#mygameschart").get(0).getContext("2d");
	var mygameschart = new Chart(ctx).Line(data);
}

// Show menus. "me" > user games, "compete", "worldscores", "friendscores", "options".
function showDude(dude) {
	if (dude == "me") {
		drawMyChart()
		$(".dude").fadeOut();
		$("#me").fadeIn();
	}
}

$("#status").click(function() {
	$(this).fadeOut();
});

// popups

$(".close").click(function() {
	$(this).parent().fadeOut();
});
$("#about").click(function() {
	$(".popups").fadeOut();
	$("#aboutmenu").fadeIn();
});


// start

function start() {

	levels = 0;
	correct = 0;
	incorrect = 0;
	points = 0;
	extrapoints = 0;
	currentword = 0;
	currentindex = 0;
	isplaying = true;
	allowwrong = true;
	runtime = 0;

	hideMenu();
	sortWords();
	injectInitialWords();
	thisletters = newwords[currentword].split("");
	insertSpans();
	updateData();
	$(".timespent").css("width", "0%");
	$("#timems").html("00");
	$("#times").html("00");
	$("#timem").html("00");
	$("#wordsh > div.timespenth").fadeIn();
	$(".popups").fadeOut();
	$(".dude").fadeOut();
}
$("#play").click(function () {
	start();
});
$("#replay").click(function () {
	$("#results").fadeOut();
	start();
});
$("#home").click(function () {
	$("#results").fadeOut();
	showMenu();

});

// main menu dudes

$("#compete").click(function() {
	showDude("compete");
});
$("#worldscores").click(function() {
	showDude("worldscores");
});
$("#friendscores").click(function() {
	showDude("friendscores");
});

$("#login").click(function() {
	if (!signedin) {
		$(".popups").fadeOut();
		$("#loginmenu").fadeIn();
	}
	else {
		showDude("me");
	}
});

// sign in

$("#logout").click(function() {
	saveLocal();
	disconnectUser(usercredentials.token);
});
function signinCallback(authResult) {
	showPopup("signing in", false);
	if (authResult['access_token']) {
		usercredentials.token = authResult['access_token'];
		$("#login").html("profile");
		gapi.client.load('plus','v1', function(){
			var request = gapi.client.plus.people.get({
				'userId': 'me'
			});
			request.execute(function(resp) {
				console.log(resp);
				if (resp.nickname.length != 0) {
					usercredentials.name = resp.nickname;
				}
				else if (resp.name.givenName.length != 0) {
					usercredentials.name = resp.name.givenName;
				}
				if (resp.image.url.length != 0) {
					usercredentials.profileimage = resp.image.url;
				}
				usercredentials.givenname = resp.name.givenName;
				usercredentials.familyname = resp.name.familyName;
				$("#login").html("<img src='" + usercredentials.profileimage + "' /><b>" + usercredentials.name+"</b>");
				$("#myname").html("" + usercredentials.givenname + " " + usercredentials.familyname + "");
				$("#myprofileimage").attr("src", usercredentials.profileimage);
				showPopup("signed in", true);
				saveLocal();
				signedin = true;
			});
		});
		$("#loginmenu").fadeOut();
	}
	else if (authResult['error']) {
		if (authResult['error'] != "immediate_failed") {
			showPopup("error signing in", true);
		}
		else {
			showPopup("not signed in. sign in for awesome features! ", true, 2000);
		}
		console.log('Sign-in state: ' + authResult['error']);
	}
}
// Update the app to reflect a signed out user
// Possible error values:
//   "user_signed_out" - User is signed-out
//   "access_denied" - User denied access to your app
//   "immediate_failed" - Could not automatically log in the user

// sign out

function signOut() {
	disconnectUser(usercredentials["token"]);
}

function disconnectUser(access_token) {
	showPopup("signing out", false);
	var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' + access_token;

	$.ajax({
		type: 'GET',
		url: revokeUrl,
		async: false,
		contentType: "application/json",
		dataType: 'jsonp',
		success: function(nullResponse) {
			$("#login").html("sign in");
			usercredentials = {
				name: "",
				givenname: "",
				familyname: "",
				type: "googleplus",
				token: "",
				games: []
			};
			showPopup("signed out", true);
			signedin = false;
		},
		error: function(e) {
			showPopup("error signing out", true);
		}
	});
}

// social

function getShareString() {
	// return "I scored " + points + " on typga.me in " + getRunningTime()[0] + ":" + getRunningTime()[1] + ":" + getRunningTime()[2] + "! Can you beat me? Play now ";// http://typega.me/
	return "I scored " + points + " on typga.me and got only "+incorrect+" wrong! Can you beat me? Play now ";// http://typega.me/
}
$("#sharefacebook").click(function() {
	window.open('https://www.facebook.com/dialog/feed? app_id=341520039318030&link=' + encodeURIComponent('http://typega.me/') + '&picture=' + encodeURIComponent('http://typega.me/images/icon128.png') + '&name=' + encodeURIComponent('Beat my score of ' + points + ' points! ') + '&caption=' + encodeURIComponent('typega.me - type, type and type. ') + '&description=' + encodeURIComponent(getShareString()) + '&redirect_uri=' + encodeURIComponent('http://typega.me/') + '', 'facebook-share-dialog', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=490,width=980'); return false;
});
$("#sharetwitter").click(function() {
	window.open('https://twitter.com/share?hashtags=typega.me&original_referer=' + encodeURIComponent('http://typega.me/') + '&text=' + encodeURIComponent(getShareString()) + '&tw_p=tweetbutton&url=' + encodeURIComponent('http://typega.me/') + '&via=thebunniesinc', 'twitter-share-dialog', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=626,width=436');
	return false;
});
$("#sharegoogleplus").click(function() {
	window.open('https://plus.google.com/share?url=' + encodeURIComponent('http://typega.me/') + '', 'googleplus-share-dialog', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=500');
	return false;
});



$(document).ready(function () {
	setTimeout(function() {
		$("#status").fadeOut(200);
	}, 0);
	// window.applicationCache.update();
	window.applicationCache.addEventListener('updateready', function(e) {
		if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
			window.applicationCache.swapCache();
			setTimeout(function() {
				showPopup("a new version is available. refreshing", false);
			}, 2000);
			setTimeout(function() {
				window.location.reload();
			}, 4000);
		} else {
		}
	}, false);
	window.applicationCache.addEventListener('downloading', function(e) {
		if (e.lengthComputable) {
			showPopup("downloading... " + Math.round(e.loaded / e.total * 100) + "%...", false);
		}
		else {
			showPopup("downloading... ", false);
		}
	}, false);
	/*
	window.applicationCache.addEventListener('online', function(e) {
		showPopup("you are online", true, 1000);
	}, false);
	window.applicationCache.addEventListener('offline', function(e) {
		showPopup("you are offline", true, 1000);
	}, false);
	*/
});

/**
 * Insert new file in the Application Data folder.
 *
 * @param {File} fileData File object to read data from.
 * @param {Function} callback Function to call when the request is complete.
 */
function insertFileInApplicationDataFolder(fileData, callback) {
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  var reader = new FileReader();
  reader.readAsBinaryString(fileData);
  reader.onload = function(e) {
    var contentType = fileData.type || 'application/octet-stream';
    var metadata = {
      'title': fileData.fileName,
      'mimeType': contentType,
      'parents': [{'id': 'appdata'}]
    };

    var base64Data = btoa(reader.result);
    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

    var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody});
    if (!callback) {
      callback = function(file) {
        console.log(file)
      };
    }
    request.execute(callback);
  }
}

/* easter egg! */
function scrambleDocument(){function a(a){return a.replace(/\b(\w)(\w+)(\w)\b/gi,function(a,b,c,d){splitext=c.split("");for(var e=splitext.length;e>1;){e--;var f=Math.floor(Math.random()*(e+1)),a=splitext[f];splitext[f]=splitext[e+1],splitext[e+1]=a}return b+splitext.join("")+d})}function b(c){for(var d=0;d<c.length;++d)3==c[d].nodeType?c[d].nodeValue=a(c[d].nodeValue):b(c[d].childNodes)}function c(){var a=document.getElementsByTagName("body");b(a)}c()}










