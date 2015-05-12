/*
window.onerror = function(message, url, lineNumber) {
	//console.log("Error: "+message+" in "+url+" at line "+lineNumber);
	alert("Error: "+message+" in "+url+" at line "+lineNumber);
	
}
 */



pagesTracker = [];
pagesTracker.push('main_page');
var pushNotification;





var app = { 
	
	pictureSource : '',
	destinationType : '',
	encodingType : '',	
	backPage : '',
	currentPageId : '',
	currentPageWrapper : '',
	recentScrollPos : '',
	
	action : '',
	requestUrl : '',
	requestMethod : '',
	response : '',
	responseItemsNumber : '',
	pageNumber : '',
	itemsPerPage : 30,
	container : '',
	usersContainer : '',
	template : '',
	statAction : '',
	searchFuncsMainCall: '',
	sort: '',
	
	profileGroupTemplate : '',
	profileLineTemplate : '',
	profileLineTemplate2 : '',
	
	userId : '',
	reportAbuseUserId : '',
	gcmDeviceId : '',
	imageId : '',
	positionSaved : false,
	logged: false,
	exit: false,
	countMes: 0,
	newMessagesCount : 0,
	
	EULA: false,
	
		
	init: function(){
		//navigator.splashscreen.hide();		
		app.ajaxSetup();
		app.pictureSource = navigator.camera.PictureSourceType;
		app.destinationType = navigator.camera.DestinationType;
		app.encodingType = navigator.camera.EncodingType;
		$('#login_page').css({'height':(($('#header').width()*1.55)-$('#header').height())+'px'});

		if(window.localStorage.getItem('EULA') == "accepted"){
			app.EULA = true;
		}
		app.chooseMainPage();
	},
	
	testSuccess: function(){
		alert('success');
	},
	
	testError: function(error){
		alert(error);
	},

	ajaxSetup: function(){
		
		var user = window.localStorage.getItem("user");
		var pass = window.localStorage.getItem("pass");
		
		if(user == '' && pass == ''){
			user = 'nouser';
			pass = 'nopass';
		}		
		
		$.ajaxSetup({			
			dataType: 'json',
			type: 'Get',
			timeout: 50000,
			beforeSend: function(xhr){
				//alert(user + ':' + pass);
				xhr.setRequestHeader ("Authorization", "Basic " + btoa ( user + ":" + pass) );
			},		
			statusCode:{
				
				403: function(response, textStatus, xhr){
					
					app.stopLoading();
					app.showPage('login_page');
					document.removeEventListener("backbutton", app.back, false);
					//app.printUsers();
					
					if(app.exit===false){
						app.alert('שם משתמש או סיסמה שגויים. אנא נסו שנית');
						//navigator.notification.alert('שם משתמש או סיסמה שגויים. אנא נסו שנית',
							//response.status + ':' + textStatus,	
						//	'Notification',
					//		'Notification'
					//	);
					}
					 
				}
		
			},
			
			error: function(response, textStatus, errorThrown){
				app.stopLoading();				
				//alert(response.status + ':' + errorThrown );
			},
			
			complete: function(response, status, jqXHR){
				//alert(response.status);
				app.stopLoading();
			},
		});		
	},
	
	alert: function(message){
		navigator.notification.alert(
			 message,
			 function(){},
			 'Notification',
			 'Ok'
		);
	},
	
	logout:function(){
		
		app.startLoading();
		clearTimeout(newMesssages);		
		pagesTracker = [];
		pagesTracker.push('login_page');
		app.exit = true;
		
		$.ajax({				
			url: 'http://m.kosherdate.co.il/api/v1/user/logout',			
			success: function(data, status){	
				//alert(JSON.stringify(data));
				if(data.logout == 1){					
					app.logged = false;					
					app.positionSaved = false;
					window.localStorage.setItem("userId", "");
					window.localStorage.setItem("user", "");
					window.localStorage.setItem("pass", "");
					app.UIHandler();
					app.ajaxSetup();
					app.stopLoading();
				}				
			}
		});
	},
	
	UIHandler: function(){
		
		document.removeEventListener("backbutton", app.back, false);
		
		if(app.logged === false){
			//var userInput = window.localStorage.getItem("userInput");
			var userInput = decodeURIComponent( escape(window.localStorage.getItem("userInput")) );
			if(userInput != "null")
				$('#user_input').find('input').val(userInput);
			
			$('.appPage').hide();
			$('.new_mes').hide();
			$("#login_page").show();  
			$('#back').hide();
			$('#logout').hide();
			$('#contact').hide();
			$('#sign_up').show();
			//app.printUsers();
			app.currentPageId = 'login_page';
			app.currentPageWrapper = $('#'+app.currentPageId);
		}
		else{
			$('.appPage').hide();
			$("#main_page").show();					
			$('#back').hide();
			$('#logout').show();
			$('#sign_up').hide();
			//$('#contact').show();								 
			app.currentPageId = 'main_page';
			app.currentPageWrapper = $('#'+app.currentPageId);
			
		}
	},
	
	loggedUserInit: function(){
		app.searchFuncsMainCall = true;
		app.setBannerDestination();
		app.checkNewMessages();					
		app.pushNotificationInit();
		app.sendUserPosition();
	},
	
	startLoading: function(){
		$('.loading').show();
	},
	
	stopLoading: function(){
		$('.loading').hide();
	},	
	
	chooseMainPage: function(){
		
		pagesTracker = [];
		pagesTracker.push('main_page');	
		app.startLoading();
		app.exit = false;

		$('#header, #beforeHead').css({"position":"fixed"});
		
		if(app.EULA === false){
			app.showPage('EULA_page');
			$('#back').hide();
			app.stopLoading();
			return;
		}
	
		$.ajax({ 
			url: 'http://m.kosherdate.co.il/api/v1/user/login',
			error: function(response){				
				//alert(JSON.stringify(response));
			},
			statusCode:{
				403: function(response, status, xhr){
					app.logged = false;
					app.UIHandler();						
				}
			},
			success: function(data, status){
				//alert(JSON.stringify(data));
				if(data.userId > 0){
					app.logged = true;
					window.localStorage.setItem("userId", data.userId);
					app.UIHandler();
					app.loggedUserInit();
					$(window).unbind("scroll");
					window.scrollTo(0, 0);
				}		
			}
		});		
	},
	
	acceptEULA: function(accept){
		if(accept === true){
			window.localStorage.setItem("EULA", "accepted");
			app.EULA = true;
			app.chooseMainPage();
		}
	},
	
	setBannerDestination: function(){
		$.ajax({				
			url: 'http://m.kosherdate.co.il/api/v1/user/banner',			
			success: function(response, status){
				app.response = response;
				//alert(JSON.stringify(app.response));   
				$('#bannerLink').attr("onclick",app.response.banner.func);
				if(app.response.banner.src!==''){
					$('#why_subscr').find('button').hide();
					if($('#bannerLink').find("img").size()===0)
						$('#why_subscr').append('<img src="'+app.response.banner.src+'" />');
					else{
						$('#bannerLink').find("img").attr("src",app.response.banner.src);
						$('#bannerLink').find("img").show();
					}
				}else{
					$('#bannerLink').find("img").hide();
					$('#why_subscr').find('button').text(app.response.banner.text).show();
				}
			}
		});
	},
	
	
	
	sendAuthData: function(){		
		var user = $("#authForm .email").val(); 
		var pass = $("#authForm .password").val();
		
		user = unescape(encodeURIComponent(user));
		pass = unescape(encodeURIComponent(pass));
		
		app.exit = false;
		window.localStorage.setItem("user",user);
		window.localStorage.setItem("pass",pass);	
		$.ajax({				
			url: 'http://m.kosherdate.co.il/api/v1/user/login',			
			beforeSend: function(xhr){
				user = window.localStorage.getItem("user");
				pass = window.localStorage.getItem("pass");	
				xhr.setRequestHeader ("Authorization", "Basic " + btoa ( user + ":" + pass) );				
			},
			success: function(data, status){	
				if(data.userId > 0){
					app.logged = true;					
					app.ajaxSetup();
					app.showPage('main_page');
					$('#logout').show();
					window.localStorage.setItem("userId", data.userId);
					window.localStorage.setItem("userInput", user);
					$("#authForm .password").val("");
					app.loggedUserInit();
					//document.removeEventListener("backbutton", app.back, false);
				}				
			}
		});
	},
	
	sendUserPosition: function(){			
		if(app.positionSaved === false){	
			navigator.geolocation.getCurrentPosition(app.persistUserPosition, app.userPositionError);
		}
	},
	
	persistUserPosition: function(position){	
		var data = {
			longitude: position.coords.longitude,
			latitude: position.coords.latitude
		};
			
		//alert(JSON.stringify(data));
		//return;
		
		$.ajax({
			url: 'http://m.kosherdate.co.il/api/v1/user/location',
			type: 'Post',
			data:JSON.stringify(data),
			success: function(response){
				app.response = response;
				app.positionSaved = app.response.result;			
			}
		});
	},
	
	userPositionError: function(error){		
		//alert('code: '    + error.code    + '\n' +
	    //      'message: ' + error.message + '\n');		
	},
	
	printUsers: function(){
		$.ajax({
			url: 'http://m.kosherdate.co.il/api/v1/users/recently_visited/2',
			success: function(data, status){
				for ( var i = 0; i < data.users.length; i++) {
					$("#udp_"+i).find(".user_photo_wrap .user_photo").attr("src",data.users[i].mainImage);
					$("#udp_"+i).find("span").text(data.users[i].nickName);
					$("#udp_"+i).find(".address").text(data.users[i].city);
				}				
				//$(".user_data_preview").slideToggle("slow");
				$(".user_data_preview").show();			
			}
		});
	},
	
	contact: function(){		
		//window.location.href = 'http://dating4disabled.com/contact.asp';		
	},
		
	pushNotificationInit: function(){
		
		try{ 
        	pushNotification = window.plugins.pushNotification;
        	pushNotification.register(app.tokenHandler, app.errorHandler, {"badge":"true", "sound":"true", "alert":"true", "ecb":"app.onNotificationAPN"});
			//alert('1');
        }
		catch(err){ 
			txt="There was an error on this page.\n\n"; 
			txt+="Error description: " + err.message + "\n\n"; 
			alert(txt); 
		} 
		
	},	
	
	persistApnDeviceId: function(){
		//alert(app.apnDeviceId);
		$.ajax({
		   url: 'http://m.kosherdate.co.il/api/v1/user/deviceId/OS:iOS',
		   type: 'Post',
		   data: JSON.stringify({deviceId: app.apnDeviceId}),
		   success: function(data, status){
		   //alert(data.error);
		   //alert(data.persisting);
		   }
		});
	},
	
	tokenHandler: function(result) {
		console.log('success:'+ result);
		//alert('success:'+ result);
		app.apnDeviceId = result;
	
		//alert(window.localStorage.getItem("userId"));
		//alert(window.localStorage.getItem("userId"));
		//alert(result);
		app.persistApnDeviceId();
	
		// Your iOS push server needs to know the token before it can push to this device
		// here is where you might want to send it the token for later use.
	},
	
	onNotificationAPN: function(event) {
		if (event.alert) {
			//navigator.notification.alert(event.alert);
		
			app.checkNewMessages();
		
			if(app.currentPageId != 'chat_page'){
				//alert(app.currentPageId);
			
				navigator.notification.confirm('קיבלת הודעה חדשה',  // message
				   app.pushNotificationChoice,              // callback to invoke with index of button pressed
				   'Notification',            // title
				   'Messenger,Later'          // buttonLabels
			   );
			}
		}
	
		if (event.sound) {
			var snd = new Media(event.sound);
			snd.play();
		}
	
		if (event.badge) {
			//navigator.notification.alert('test');
			pushNotification.setApplicationIconBadgeNumber(app.successHandler, app.errorHandler, event.badge);
		}
	},
	
	errorHandler: function (error) {
		//alert('error:'+ error);
		console.log('ERROR:'+ error);
	},
	
	successHandler: function (result) {
		//alert('success:'+ result);
	},
	
	pushNotificationChoice: function(buttonPressedIndex){
		if(buttonPressedIndex == 1){
			app.getMessenger();
		
		}
	},
	
	back: function(){	
		$.fancybox.close();
		//app.startLoading();
		$(window).unbind("scroll");
		window.scrollTo(0, 0);
		//alert(pagesTracker);
		pagesTracker.splice(pagesTracker.length-1,1);
		//alert(pagesTracker);
		var prevPage = pagesTracker[pagesTracker.length-1];		
		//alert(prevPage); 
		
		if(typeof prevPage == "undefined" || prevPage == "main_page" ||  prevPage == "login_page")
			//app.showPage('main_page');
			app.chooseMainPage();
		else
			app.showPage(prevPage);
		
		if(app.currentPageId == 'users_list_page'){
			app.template = $('#userDataTemplate').html();
			window.scrollTo(0, app.recentScrollPos);
			app.setScrollEventHandler();
		}
		app.searchFuncsMainCall = true;
		app.stopLoading();
	},
	
	showPage: function(page){		
		app.currentPageId = page;
		app.currentPageWrapper = $('#'+app.currentPageId);
		app.container = app.currentPageWrapper.find('.content_wrap');
		if(pagesTracker.indexOf(app.currentPageId)!=-1){			
			pagesTracker.splice(pagesTracker.length-1,pagesTracker.indexOf(app.currentPageId));
			
		}
		if(pagesTracker.indexOf(app.currentPageId) == -1){
			pagesTracker.push(app.currentPageId);
		}		
		$('.appPage').hide();
		//alert('1');
		app.currentPageWrapper.show();	
		
		
		if(app.currentPageId == 'main_page'){
			$('#back').hide();
			$('#sign_up').hide();
			//$('#contact').show();			
		}
		else if(app.currentPageId == 'login_page'){
			$('#back').hide();
			$('#sign_up').show();
			//$('#contact').hide();
		}		
		else{
			$('#back').show();
			$('#sign_up').hide();
			//$('#contact').hide();
			document.addEventListener("backbutton", app.back, false);
		}
		
		$(window).unbind("scroll");
		
	},
	
	sortByDistance: function(){
		app.sort = 'distance';		
		$('#sortByDistance').hide();
		$('#sortByEntranceTime').show();
		app.chooseSearchFunction();		
	},
	
	sortByEntranceTime: function(){
		app.sort = '';		
		$('#sortByEntranceTime').hide();
		$('#sortByDistance').show();		
		app.chooseSearchFunction();
	},
	
	chooseSearchFunction: function(){
		
		app.searchFuncsMainCall = false;
		
		if(app.action == 'getOnlineNow'){					
			app.getOnlineNow();			
		}			
		else if(app.action == 'getSearchResults'){
			app.search();
		}
		else if(app.action == 'getStatResults'){
			app.getStatUsers(app.statAction);
		}
	},
	
	getOnlineNow: function(){
		app.showPage('users_list_page');		
		app.currentPageWrapper.find('.content_wrap').html('');
		app.template = $('#userDataTemplate').html();
		app.container = app.currentPageWrapper.find('.content_wrap');
		app.container.append('<h1>תוצאות</h1><div class="dots"></div>');
		app.action = 'getOnlineNow';
		app.pageNumber = 1;
		app.getUsers();
	},
	
 
	getUsers: function(){
		app.startLoading();		
		
		if(app.searchFuncsMainCall === true && app.positionSaved === true){
			$('#sortByEntranceTime').hide();			
			$('#sortByDistance').show();
			app.sort = '';
		}
		
		if(app.action == 'getOnlineNow'){					
			app.requestUrl = 'http://m.kosherdate.co.il/api/v1/users/online/count:'+app.itemsPerPage+'/page:'+app.pageNumber+'/sort:'+app.sort;
		}
		else if(app.action == 'getSearchResults'){
			var religionId = $('#search_form_page .religionList select').val();
			var countryRegionId = $('#search_form_page .regionsList select').val();
			var ageFrom = $(".age_1 select").val();
			var ageTo = $(".age_2 select").val();			
			var nickName = $('.nickName').val();
			//var userGender=$('.gen input[name="gen"]:checked').val();
			app.requestUrl = 'http://m.kosherdate.co.il/api/v1/users/search/religionId:'+religionId+'/countryRegionId:'+countryRegionId+'/age:'+ageFrom+'-'+ageTo+'/nickName:'+nickName+'/count:'+app.itemsPerPage+'/page:'+app.pageNumber+'/sort:'+app.sort;
			//alert(app.requestUrl);
		}	
		else if(app.action == 'getStatResults'){					
			app.requestUrl = 'http://m.kosherdate.co.il/api/v1/user/statistics/'+app.statAction+'/count:'+app.itemsPerPage+'/page:'+app.pageNumber+'/sort:'+app.sort;
		}
		
		$.ajax({						
			url: app.requestUrl,
			timeout:10000,
			success: function(response, status){
				app.response = response;
				//alert(JSON.stringify(app.response));
			   if(app.response.users.itemsNumber=='0'&&app.pageNumber==1)
				app.container.append('<h1 style="width:100%;text-align:center;margin-top:20px;">חיפוש הסתיים ללא תוצאות</h1>');
			   else
				app.displayUsers();
			}//,
			//error: function (err){
			//   alert(JSON.stringify(err));
			//}
		});
	},	
	
	
	displayUsers: function(){
		for(var i in app.response.users.items){
			var currentTemplate = app.template; 
			var user = app.response.users.items[i];
			currentTemplate = currentTemplate.replace("[USERNICK]",user.nickName);
			currentTemplate = currentTemplate.replace("[AGE]",user.age);
			//currentTemplate = currentTemplate.replace("[COUNTRY]",user.country+',');
			if(user.city==null)user.city='';
			currentTemplate = currentTemplate.replace("[CITY]",user.city);
			currentTemplate = currentTemplate.replace("[IMAGE]",user.mainImage);			
			currentTemplate = currentTemplate.replace(/\[USERNICK\]/g,user.nickName);										
			currentTemplate = currentTemplate.replace("[USER_ID]", user.id);	
			var aboutUser = user.about;
			//if(aboutUser==null)aboutUser='';
			//if(typeof(user.about) === 'string'){   
			//	if(user.about.length > 90){
			//		aboutUser = user.about.substring(0,90)+'...';
			//	}
			//	else{
			//		aboutUser = user.about;
			//	}
			//}				
			//alert(aboutUser);
			
			currentTemplate = currentTemplate.replace("[ABOUT]", aboutUser);			
			app.container.append(currentTemplate);			
			var currentUserNode = app.container.find(".user_data:last-child");		
			//alert(currentUserNode.find('.user_short_txt').css('text-align'));
			currentUserNode.find(".user_short_txt").attr("onclick","app.getUserProfile("+user.id+");");
			currentUserNode.find(".user_photo_wrap").attr("onclick","app.getUserProfile("+user.id+");");
			if(user.isNew == 1){						
				currentUserNode.find(".blue_star").show();
			}					
			if(user.isPaying == 1){						
				currentUserNode.find(".special3").show();
			}
			if(user.isOnline == 1){						
				currentUserNode.find(".on2").show();				
			}else{
				currentUserNode.find(".on1").show();
			}
			if(user.distance != ""){						
				currentUserNode.find(".distance_value").show().find("span").html(user.distance);
			}
			if(user.id==window.localStorage.getItem("userId")){currentUserNode.find('.send_mes').hide();}
		}
		//setTimeout(app.stopLoading(), 10000);
		//app.stopLoading();
		app.responseItemsNumber = app.response.users.itemsNumber;
		app.setScrollEventHandler();
	},	
	
		
	setScrollEventHandler: function(){
		$(window).scroll(function(){	
			var min=700;
			//alert($(this).width());
			if($(this).width()>500)min=1300;
			app.recentScrollPos = $(this).scrollTop();
			if(app.recentScrollPos >= app.container.height()-min){						
				$(this).unbind("scroll");				
				if(app.responseItemsNumber == app.itemsPerPage){					
					app.pageNumber++;					
					app.getUsers();
				}
			}
		});
	},
	
	getMyProfileData: function(){		
		app.startLoading();
		$("#upload_image").click(function(){		
			$("#statistics").hide();
			$("#uploadDiv").css({"background":"#fff"});
			$("#uploadDiv").show();
			
			$('#get_stat_div').show();
			$('#upload_image_div').hide();
		});
		$("#get_stat").click(function(){		
			$("#statistics").show();			
			$("#uploadDiv").hide();
			
			$('#get_stat_div').hide();
			$('#upload_image_div').show();			
		});	
		var userId = window.localStorage.getItem("userId");		
		$.ajax({
			url: 'http://m.kosherdate.co.il/api/v1/user/profile/'+userId,						
			success: function(user, status, xhr){
				app.showPage('my_profile_page');
				app.container = app.currentPageWrapper.find('.myProfileWrap');		
				app.container.find('.txt strong').html(user.nickName+', <span>'+user.age+'</span>');			
				app.container.find('.txt strong').siblings('span').text(user.city); 
				app.container.find('.txt').append(user.about);			
				app.container.find('.user_pic img').attr("src",user.mainImage);		
				if(user.isPaying==1){
					app.container.find(".special4").show();
				}
			   //alert( JSON.stringify(user.statistics));
				//console.log(JSON.stringify(user));
				//return;
				var addedToFriends = user.statistics.fav;  
				var contactedYou = user.statistics.contactedme;
				var contacted = user.statistics.contacted;
				var addedToBlackList = user.statistics.black;
				var addedYouToFriends = user.statistics.favedme;
				var lookedMe = user.statistics.lookedme;
				app.container.find(".stat_side").eq(1).find(".items_wrap").eq(0).find(".stat_value").text(addedToFriends);    
				app.container.find(".stat_side").eq(0).find(".items_wrap").eq(1).find(".stat_value").text(contactedYou);
				app.container.find(".stat_side").eq(1).find(".items_wrap").eq(2).find(".stat_value").text(contacted);
				app.container.find(".stat_side").eq(1).find(".items_wrap").eq(1).find(".stat_value").text(addedToBlackList);
				app.container.find(".stat_side").eq(0).find(".items_wrap").eq(0).find(".stat_value").text(addedYouToFriends);				
				app.container.find(".stat_side").eq(0).find(".items_wrap").eq(2).find(".stat_value").text(lookedMe);
				app.stopLoading();				
			}
		});
	},	
	
	getStatUsers: function(statAction){		
		app.showPage('users_list_page');		
		app.currentPageWrapper.find('.content_wrap').html('');
		app.template = $('#userDataTemplate').html();
		app.container = app.currentPageWrapper.find('.content_wrap');
		app.container.append('<h1>תוצאות</h1><div class="dots"></div>');
		app.pageNumber = 1;
		app.action = 'getStatResults';
		app.statAction = statAction;		
		app.getUsers();
	},
	
	getEditProfile: function(){
		$.ajax({
		   url: 'http://m.kosherdate.co.il/api/v1/getedit',
		   success: function(response){
			   //alert(JSON.stringify(response));
			   app.response = response.user;
			   app.showPage('edit_profile_page');
			   app.container = app.currentPageWrapper.find('.edit_wrap');
			   app.container.html('');
			   app.template = $('#userEditProfileTemplate').html();
			   app.template = app.template.replace(/\[userNick\]/g,response.user.userNick);
			   app.template = app.template.replace(/\[userPass\]/g,response.user.userPass);
			   app.template = app.template.replace(/\[userEmail\]/g,response.user.userEmail);
			   app.template = app.template.replace(/\[userCity\]/g,response.user.userCity);
			   if(response.user.userAboutMe==null)response.user.userAboutMe='';
			   if(response.user.userLookingFor==null)response.user.userLookingFor='';
			   app.template = app.template.replace(/\[userAboutMe\]/g,response.user.userAboutMe);
			   app.template = app.template.replace(/\[userLookingFor\]/g,response.user.userLookingFor);
			   app.template = app.template.replace(/\[userfName\]/g,response.user.userfName);
			   app.template = app.template.replace(/\[userlName\]/g,response.user.userlName);
			   app.template = app.template.replace(/\[Y\]/g,response.user.Y);
			   app.template = app.template.replace(/\[n\]/g,response.user.n);
			   app.template = app.template.replace(/\[j\]/g,response.user.j);
			   if(response.user.userGender=='1')
				app.template = app.template.replace(/\[userGenderName\]/g,'גבר');
			   else
				app.template = app.template.replace(/\[userGenderName\]/g,'אישה');
			   app.container.html(app.template).trigger('create');
			   app.getRegions();
			   app.getReligions();
			   $('#userBirth').html(app.getBithDate()).trigger('create');
			   app.container.find('.userGender').html(app.getuserGender()).trigger('create');
		   },
		   error: function(err){
			   //alert(JSON.stringify(err));
		   }
		});
	},
	
	getuserGender: function(){
		var html = '<select name="userGender" data-iconpos="left" id="userGender" onchange="app.delRed(this);">';
		html = html + '<option value="1"';
		if(app.response .userGender=='1')
			html = html + ' selected="selected" ';
		html = html + '>גבר</option>';
		html = html + '<option value="0"';
		if(app.response .userGender=='0')
			html = html + ' selected="selected" ';
		html = html + '>אישה</option></select>';
		return html;
	},
    
	saveProf: function (el,tag){
		var name = '';
		var val = '';
		var input = $(el).parent().find(tag);
		if(input.size()=='3'){
			var er=false;
			input.each(function(index){
				if(index!='0')val=val+'-';
				val=val+$(this).val();
				if($(this).val().length==0){
				   alert('אנא תמאו ת. לידה');
				   er=true;
				}
			});
			if(er)return false;
			name = 'userBirthday';
		}else{
			name = input.attr('name');
			val = input.val();
		}
		//alert(name+'='+val);//return false;
		if(name=='userPass'&&(val.length < 6||$('#userPass2').val()!==val)){
			if(val.length < 6)
				alert('סיסמה קצר מדי');
			if($('#userPass2').val()!==val)
				alert('מספר נתונים אינם תקנים: סיסמה או סיסמה שנית');
			return false;
		}
		if((val.length < 3 && tag != 'select' && name != 'userGender')||( val.length==0 && (tag=='select' || name == 'userGender' ))){
			alert($(el).parent().parent().prev().find('span').text()+' קצר מדי');
			return false;
		}
		var email_pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);
		if (!(email_pattern.test(val))&&name=='userEmail') {
			alert("כתובת הדואר האלקטרוני שהזנת אינה תקינה");
			return false;
		}
	
		if($(el).parent().find('.userFailed').length > 0&&$(el).parent().find('.userFailed').is(":visible"))
			return false;
		app.startLoading();
		//alert(name+'='+val);
		$.ajax({
		   url: 'http://m.kosherdate.co.il/api/v1/saveprofile',
		   //dataType: 'json',
		   type: 'post',
		   data: JSON.stringify({name:name,val:val}),
		   contentType: "application/json; charset=utf-8",
		   success : function(res){
			   app.stopLoading();
			   //alert(JSON.stringify(res));return false;
			   if(res.err == '1'){
				//check(input.attr('id'),val);
				alert(res.text);
				$(el).parent().find('.input').css({'background':'red'});
			   }else if(res.res == '1'){
				//alert(val);
				alert('עדכון נשמר');
				if(tag=='select'&&name!='userBirthday'&&name!='userGender'){
					val = $(el).parent().find('.ui-select span').eq(1).text();
					//alert(val);
				}
				if(val=='0'&&name=='userGender')val = 'אישה';
				if(val=='1'&&name=='userGender')val = 'גבר';
				if(name=='userBirthday') val=val.replace(/-/g,' / ');
				if(name=='userPass')
					$(el).parent().next().find('input').val(val);
				else
					$(el).parent().next().find('div').text(val);
				$('.save').hide();
				$('.edit').show();
			   }
		   },
		   error: function(err){
			   app.stopLoading();
			   //alert(JSON.stringify(err));
			   $('.save').hide();
			   $('.edit').show();
		   }
		});
	},
    
	editProf: function (el){
		var name = $(el).attr('name');
		if(name=='edit'){
			$('.save').hide();
			$('.edit').show();
			//alert($('.sf_sel_wrap .edit').size());
			$(el).parent().hide().prev().show();
		}else{
			$(el).parent().hide().next('.edit').show();
		}
	},
	
	getSearchForm: function(){
		app.startLoading();
		app.showPage('search_form_page');
		app.getRegions();
		app.getReligions();
		app.searchFuncsMainCall = true;
		//app.getSexPreference();
		//$("#regions_wrap").hide();
		//app.getCountries();
		var html = '<select data-iconpos="left">';
		for(var i = 18; i <= 80; i++){
			html = html + '<option value="' + i + '"">' + i + '</option>';
		}
		html = html + '</select>';
		
		$(".age_1").html(html);
		$(".age_1").trigger("create");
		
		var html = '<select data-iconpos="left">';
		var sel = '';
		for(var i = 19; i <= 80; i++){
			if(i == 40) sel = ' selected="selected"';
			else sel = '';
			html = html + '<option value="' + i + '"' + sel + '>' + i + '</option>';
		}
		html = html + '</select>';
		$(".age_2").html(html);
		$(".age_2").trigger("create");
		//app.formchange(true,'region');
		app.stopLoading();
	},
		
/*	getSexPreference: function(){
		$.ajax({			
			url: 'http://m.ricosybellas.com/api/v1/list/sexPreference',						
			success: function(list, status, xhr){							
				var html = '';	
				if(app.currentPageId == 'register_page'){
					for(var i in list.items){					  
						var item = list.items[i];					
						html = html + '<option value="' + item.sexPrefId + '">' + item.sexPrefName + '</option>';
					}					
					$(".sexPreferenceList").html(html);				
					$(".sexPreferenceList").val($(".sexPreferenceList").val());
					$(".sexPreferenceList").find("option[value='1']").insertBefore($(".sexPreferenceList").find("option:eq(0)"));
					$(".sexPreferenceList").val($(".sexPreferenceList").find("option:first").val()).selectmenu("refresh");
				}else if(app.currentPageId == 'search_form_page'){
					for(var i in list.items){					  
						var item = list.items[i];					
						html = html + '<input type="checkbox" id="check-sex' + item.itemId  + '" value="' + item.itemId  + '"><label for="check-sex' + item.itemId  + '">' + item.itemName + '</label>';		
					}
					$(".sexPreferenceList fieldset").html(html);
					$(".sexPreferenceList").trigger("create");					
				}
				
			}
		
		});
	},*/
	
	injectCountries: function(html, container){
		container.html(html);
		container.trigger('create');
		container.find("option[value='US']").insertBefore(container.find("option:eq(0)"));
		container.find("option[value='CA']").insertBefore(container.find("option:eq(1)"));
		container.find("option[value='AU']").insertBefore(container.find("option:eq(2)"));
		container.find("option[value='GB']").insertBefore(container.find("option:eq(3)"));
		container.val(container.find("option:first").val()).selectmenu("refresh");
	},
	
	/*getCountries: function(){
		$.ajax({
			url: 'http://m.kosherdate.co.il/api/v1/list/country',
			success: function(list, status, xhr){
				var html = '<select name="countryCode" onchange="app.getRegions($(this).val());" data-iconpos="right">';
				html = html + '<option value=""></option>';//Seleccione un país
				if(list.itemsNumber > 0){
					for(var i in list.items){					
						var item = list.items[i];					
						html = html + '<option value="' + item.countryCode + '">' + item.countryName + '</option>';
					}
					html = html + '</select>';
					app.container.find(".countryList").html(html).trigger('create');
				}
			}
		});
	},*/
	
	getRegions: function(){
		$.ajax({
			url: 'http://m.kosherdate.co.il/api/v1/list/regions',						
			success: function(list, status, xhr){	
				//alert(JSON.stringify(list));
				var html = '<select name="countryRegionId" data-iconpos="left" id="countryRegionId" onchange="app.delRed(this);">';
				if(app.currentPageId == 'search_form_page'){
					html = html + '<option value="">לא חשוב</option>';
				}
				if(app.currentPageId == 'register_page'){
					html = html + '<option value="">לבחור איזור</option>';
				}
				app.container.find(".regionsList").html('');
				if(list.itemsNumber > 0){
					for(var i in list.items){					
						var item = list.items[i];					
						html = html + '<option value="' + item.itemId + '"';
						if(app.currentPageId == 'edit_profile_page'&&item.itemId==app.response.countryRegionId){
							html = html + ' selected="selected" ';
							app.container.find(".regionsList").parent().next().children('div').text(item.itemName);
						}
						html = html + '>' + item.itemName + '</option>';
					}
					html = html + '</select>';
					app.container.find(".regionsList").html(html).trigger('create');
				}
				else{

				}
				
			},
			//error: function(response, textStatus, errorThrown){
			//	app.stopLoading();				
			//	alert(response.status + ':' + errorThrown );
			//},
		});
	},
	
	getReligions: function(){
		$.ajax({
			url: 'http://m.kosherdate.co.il/api/v1/list/religions',						
			success: function(list, status, xhr){	
				//alert(JSON.stringify(list));
				var html = '<select name="religionId" data-iconpos="left" id="religionId" onchange="app.delRed(this);">';
				if(app.currentPageId == 'search_form_page'){
					html = html + '<option value="">לא חשוב</option>';
				}
				if(app.currentPageId == 'register_page'){
					html = html + '<option value="">לבחור השקפה</option>';
				}
				app.container.find(".religionList").html('');
				if(list.itemsNumber > 0){
					for(var i in list.items){					
						var item = list.items[i];					
						html = html + '<option value="' + item.itemId + '"';
						if(app.currentPageId == 'edit_profile_page'&&item.itemId==app.response.religionId){
							html = html + ' selected="selected" ';
							app.container.find(".religionList").parent().next().children('div').text(item.itemName);
						}
						html = html + '>' + item.itemName + '</option>';
					}
					html = html + '</select>';
					app.container.find(".religionList").html(html).trigger('create');				

				}
				else{

				}
				
			}//,
			//error: function(response, textStatus, errorThrown){
			//	app.stopLoading();
			//	alert(response.status + ':' + errorThrown );
			//},
		});
	},
	/*getRegions: function(countryCode){
		if(countryCode!==''){
			$.ajax({
				url: 'http://m.kosherdate.co.il/api/v1/list/regions/'+countryCode,						
				success: function(list, status, xhr){							
					var html = '<select name="regionCode" onchange="app.getCities(\''+countryCode+'\',$(this).val());" data-iconpos="right">';
					//if(app.currentPageId == 'search_form_page'){
						html = html + '<option value=""></option>';
					//}				
					if(list.itemsNumber > 0){						
						app.formchange(true,'region');
						app.container.find(".regionsList").html('');
						for(var i in list.items){					
							var item = list.items[i];					
							html = html + '<option value="' + item.regionCode + '">' + item.regionName + '</option>';
						}
						html = html + '</select>';
						app.container.find(".regionsList").html(html).trigger('create');					
					}
					else{
						app.formchange(false,'region');
					}
				}
			});
		}else{
			app.formchange(true,'region');
		}
	},*/
	
	/*formchange: function(flag,get){
		if(flag){
			app.container.find(".cityInp").hide();
			app.container.find("#userCityName").val('');
			app.container.find(".citiesList").html("<sp>Seleccione una area</sp>").show();
			if(get=='region')app.container.find(".regionsList").html("<sp>Seleccione un país</sp>").show();
			app.container.find("#regions_wrap").show();
		}else{
			app.container.find(".cityInp").show();					
			app.container.find(".citiesList, .regionsList, #regions_wrap").hide();
			app.container.find(".regionsList select,.citiesList select").val('');
		}
	},*/
	
	/*getCities: function(countryCode,regionCode){
		if(regionCode!==''){
			$.ajax({
				url: 'http://m.kosherdate.co.il/api/v1/list/cities/'+countryCode+'/'+regionCode,						
				success: function(list, status, xhr){
					//alert( JSON.stringify(list));				
					if(list.itemsNumber > 0){
						app.formchange(true,'city');
						app.container.find(".citiesList").html('');
						var html = '<select name="userCity" id="userCity" data-iconpos="right">';
						html = html + '<option value=""></option>';
						for(var i in list.items){					
							var item = list.items[i];					
							html = html + '<option value="' + item.cityName + '">' + item.cityName + '</option>';
						}
						html = html + '</select>';
						app.container.find(".citiesList").html(html).trigger('create');								
					}
					else{
						app.formchange(false,'city');
					}
				}
			});
		}else{
			app.formchange(true,'city');
		}
	},*/
	
	sendRegData: function(){		
		if(app.formIsValid()){
			app.startLoading();
			var data = JSON.stringify(
				$('#regForm').serializeObject()
			);
			//alert(data);
			$.ajax({
				url: 'http://m.kosherdate.co.il/api/v1/user',
				type: 'Post',
				data: data,
				success: function(response){
					app.response = response;
					//alert( JSON.stringify(app.response));
					app.stopLoading();
					if(app.response.result > 0){
						var user = app.container.find("#userEmail").val(); 
						var pass = app.container.find("#userPass").val();						
						window.localStorage.setItem("user",user);
						window.localStorage.setItem("pass",pass);
						window.localStorage.setItem("userId", app.response.result);
						app.ajaxSetup(); 						
						app.getRegStep();
					}
					else{
						navigator.notification.alert(
							$('<div>'+app.response.err+'</div>').text(),								
							//app.response.result,
							'Notification',
							'Notification'
						);
					}    
				}//,error: function(error){
				//	alert( JSON.stringify(error));
				//}
			});
			
			
		}
		
	},	
		
	getRegStep: function(){
		//$('#test_test_page').show();
		$('#header, #beforeHead').css({"position":"fixed"});
		app.showPage('upload_image_page');
		//app.container.find('.regInfo').text('יש באפשרותך להעלות עד 4 תמונות מסוג  בלבד . תמונות חדשות ממתינות לאישור האתר.');  // Also you may upload an image in your profile now.
		window.scrollTo(0,0);
	},
	
	formIsValid: function(){
		var text='';
		if(app.container.find('#userNick').val().length == 0){
			app.container.find('#userNick').css({'background':'red'});
			if(text==''){
				text='אנא הזינו שם משתמש';
				app.container.find('#userNick').focus();
			}
			//return false;
		}
		if(app.container.find('#wrong_userNick').val()=='true'){
			app.container.find('#userNick').css({'background':'red'});
			if(text==''){
				text='שם המשתמש שבחרתם קיים במערכת. אנא בחרו שם חדש.';
				app.container.find('#userNick').focus();
			}
		}
		var email_pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);		
		if (!(email_pattern.test(app.container.find('#userEmail').val()))) {
			app.container.find('#userEmail').css({'background':'red'});
			if(text==''){
				text="כתובת הדואר האלקטרוני שהזנת אינה תקינה";
				app.container.find('#userEmail').focus();
			}
			//return false;
		}
		if(app.container.find('#wrong_userEmail').val()=='true'){
			app.container.find('#userNick').css({'background':'red'});
			if(text==''){
				text='כתובת הדואר האלקטרוני שבחרתם קיים במערכת. אנא בחרו אימייל חדש.';
				app.container.find('#userNick').focus();
			}
		}
		/*if ($('#userEmail').val() != $('#userEmail2').val()) {
			alert("Error in retyped email");
			$('#userEmail2').focus();
			return false;
		}*/
		
		if (app.container.find('#userPass').val().length < 6 || app.container.find('#userPass').val().length > 12) {
			app.container.find('#userPass').css({'background':'red'});
			if(text==''){
				text="סיסמה שגויה (אמור להיות 6-12 סימנים)";
				app.container.find('#userPass').focus();
			}
			//return false;
		}
		if (app.container.find('#userPass2').val().length < 6 || app.container.find('#userPass2').val().length > 12) {
			app.container.find('#userPass2').css({'background':'red'});
			if(text==''){
				text="סיסמה בשנית שגויה (אמור להיות 6-12 סימנים)";
				app.container.find('#userPass2').focus();
			}
			//return false;
		}
		if (app.container.find('#userPass').val() != app.container.find('#userPass2').val()) {
			app.container.find('#userPass2').css({'background':'red'});
			if(text==''){
				text="סיסמה שהוקלדה בשנית לא תואמת לסיסמה הראשונה";
				app.container.find('#userPass2').focus();
			}
			//return false;
		}
		
		if(app.container.find('#userGender').val() == ''){
			app.container.find('#userGender').parent().css({'background':'red'}).attr('onchange','app.delRed(this);');
			if(text==''){
				text='אנא הזינו מין';
				app.container.find('#userGender').focus();
			}
			//return false;
		}
		
		if(app.container.find('#countryRegionId').val() == ''){
			app.container.find('#countryRegionId').parent().css({'background':'red'}).attr('onchange','app.delRed(this);');
			if(text==''){
				text='אנא הזינו איזור';
				app.container.find('#countryRegionId').focus();
			}
			//return false;
		}
		
		if(app.container.find('#userCityName').val().length == 0){
			app.container.find('#userCityName').css({'background':'red'});
			if(text==''){
				text='אנא הזינו עיר';
				app.container.find('#userCityName').focus();
			}
			//return false;
		}
		if(app.container.find('#religionId').val().length == 0){
			app.container.find('#religionId').parent().css({'background':'red'}).attr('onchange','app.delRed(this);');
			if(text==''){
				text='אנא הזינו השקפה';
				app.container.find('#religionId').focus();
			}
			//return false;
		}
		if(app.container.find('#userfName').val().length == 0){
			app.container.find('#userfName').css({'background':'red'});
			if(text==''){
				text='אנא הזינו שם פרטי';
				app.container.find('#userfName').focus();
			}
			//return false;
		}
		if(app.container.find('#userlName').val().length == 0){
			app.container.find('#userlName').css({'background':'red'});
			if(text==''){
				text='אנא הזינו שם משפחה';
				app.container.find('#userlName').focus();
			}
			//return false;
		}
		if(app.container.find('#d').val().length == 0 || app.container.find('#m').val().length == 0 || app.container.find('#y').val().length == 0){
			if(app.container.find('#d').val().length == 0){
				app.container.find('#d').parent().css({'background':'red'}).attr('onchange','app.delRed(this);');
				//$('#d').focus();
			}
			if(app.container.find('#m').val().length == 0){
				app.container.find('#m').parent().css({'background':'red'}).attr('onchange','app.delRed(this);');
				//$('#m').focus();
			}
			if(app.container.find('#y').val().length == 0){
				app.container.find('#y').parent().css({'background':'red'}).attr('onchange','app.delRed(this);');
				//$('#y').focus();
			}
			if(text==''){
				text='אנא הזינו תאריך לידה';
			}
			//return false;
		}
		

		if(text!=''){
			alert(text);
			return false;
		}
		/*if($('#confirm option:selected').val() != "1"){
			alert('Please check confirmation box');
			return false;
		}*/
		return true;
	},
	
	delRed: function(el){
		$(el).attr('style','');
	},
	
	search: function(pageNumber){
		app.showPage('users_list_page');		
		app.template = $('#userDataTemplate').html();
		app.container = app.currentPageWrapper.find('.content_wrap');
		app.container.html('');
		app.container.append('<h1>תוצאות</h1><div class="dots"></div>');
		app.pageNumber = 1;
		app.action = 'getSearchResults';
		app.getUsers();
	},
	
	reportAbuse: function(){
		var abuseMessage = $('#abuseMessage').val();
		$.ajax({
		   url: app.apiUrl+'/api/v2/user/abuse/'+app.reportAbuseUserId,
		   type: 'Post',
		   contentType: "application/json; charset=utf-8",
		   data: JSON.stringify({abuseMessage: abuseMessage}),
		   error: function(response){
			   //alert(JSON.stringify(response));
		   },
		   success: function(response, status, xhr){
			   $('#abuseMessage').val('');
			   app.alert('Thank you for your report. The message has been sent');
			   app.back();
		   }
		});
	},
	
	getUserProfile: function(userId){
		if(userId==window.localStorage.getItem("userId")){app.getMyProfileData(); return;}
		app.ajaxSetup();
		app.startLoading();	
		$.ajax({
			url: 'http://m.kosherdate.co.il/api/v1/user/profile/'+userId,
			type: 'Get',
			success: function(user, status, xhr){
				//alert( JSON.stringify(user));
				app.showPage('user_profile_page');
				window.scrollTo(0, 0);
				var detailsContainer = app.container.find('#user_details');
				app.container.find('#pic1, #pic2, #pic3').attr("src","");
				app.container.find(".special3, .blue_star, .on5, .pic_wrap").hide();
				app.container.find('.pic_wrap').addClass("left").removeClass("center");
				app.container.find('#pic1').parent('a').addClass("fancybox");
				app.container.find("h1 span").text(user.nickName);
				app.container.find('#pic1').attr("src",user.mainImage).parent('a').attr({"href":user.mainImage, "rel":"images_"+user.userId});				
				if(user.mainImage == "images/0.jpg"
				|| user.mainImage == "images/1.jpg"){
					app.container.find('#pic1').parent('a').removeClass("fancybox").attr("href","#");
				}
				app.container.find('.pic_wrap').eq(0).show();				
				app.container.find('.fancybox').fancybox();
				if(typeof user.otherImages[0] !== "undefined"){
					//alert(user.otherImages[0]);
					app.container
						.find('.pic_wrap').eq(1).show()
						.find("img").attr("src",user.otherImages[0])
						.parent('a')
						.attr({"href":user.otherImages[0], "rel":"images_"+user.userId});
				}else{
					app.container.find('.pic_wrap').eq(0).addClass("center").removeClass("left");
				}
				if(typeof user.otherImages[1] !== "undefined"){
					//alert(user.otherImages[1]);
					app.container.find('.pic_wrap').eq(2).show()
						.find("img").attr("src",user.otherImages[1])
						.parent('a').attr({"href":user.otherImages[1], "rel":"images_"+user.userId});
				}				
				if(user.isPaying == 1){
					app.container.find(".special3").show();
				}
				if(user.isNew == 1){
					app.container.find(".blue_star").show();
				}				
				if(user.isOnline == 1){
					app.container.find(".on5").show();
				}
				if(user.distance != ""){						
					app.container.find(".distance_value").show().css({'right':($('#user_pictures .pic_wrap').width()*0.9-$('#user_pictures .distance_value').width())/2+'px'}).find("span").html(user.distance);
				}else{
					app.container.find(".distance_value").hide().find("span").html(user.distance);
				}
				app.profileGroupTemplate = $('#userProfileGroupTemplate').html();
				app.profileLineTemplate = $('#userProfileLineTemplate').html();
				app.profileLineTemplate2 = $('#userProfileLineTemplate2').html();
				var profileButtonsTemplate = $('#userProfileButtonsTemplate').html();
				profileButtonsTemplate = profileButtonsTemplate.replace(/\[USERNICK\]/g,user.nickName);									
				profileButtonsTemplate = profileButtonsTemplate.replace("[USER_ID]", user.userId);
				//profileButtonsTemplate.insertBefore(detailsContainer);
				var html = profileButtonsTemplate;				 				
				if(!((user.eyesColor== undefined || user.eyesColor=='') && (user.bodyType== undefined || user.bodyType=='') && (user.hairColor== undefined || user.hairColor=='') && (user.hairLength== undefined || user.hairLength=='') && (user.breast== undefined || user.breast=='')))
					html = html + app.getProfileGroup("מראה חיצוני");
				if(user.eyesColor!== undefined && user.eyesColor!=='')html = html + app.getProfileLine("צבע עיניים", user.eyesColor);
				if(user.bodyType!== undefined && user.bodyType!=='')html = html + app.getProfileLine("מבנה גוף", user.bodyType);
				if(user.hairColor!== undefined && user.hairColor!=='')html = html + app.getProfileLine("צבע שיער", user.hairColor);
				if(user.hairLength!== undefined && user.hairLength!=='')html = html + app.getProfileLine("תסרוקת", user.hairLength);
				if(user.breast!== undefined && user.breast!=='')html = html + app.getProfileLine("גודל חזה", user.breast);
				html = html + app.getProfileGroup("מידע בסיסי");
				//html = html + app.getProfileLine("Nickname", user.nickName);
				if(user.age!== undefined && user.age!=='')html = html + app.getProfileLine("גיל", user.age);
				//html = html + app.getProfileLine("נטיה מינית", user.sexPreference);
				//html = html + app.getProfileLine("נסיון עם נשים", user.experience);	
				//if(user.country!== undefined && user.country!=='')html = html + app.getProfileLine("País de Nacimiento", user.country);
				if(user.region!== undefined && user.region!=='' && user.region!==null)html = html + app.getProfileLine("אזור מגורים", user.region);
				if(user.city!== undefined && user.city!=='' && user.city!==null)html = html + app.getProfileLine("עיר מגורים", user.city);
				if(user.smoking!== undefined && user.smoking!=='')html = html + app.getProfileLine("עישון", user.smoking);
				if(user.education!== undefined && user.education!=='')html = html + app.getProfileLine("השכלה", user.education);
				if(user.occupation!== undefined && user.occupation!=='')html = html + app.getProfileLine("עיסוקי", user.occupation);
				if(user.religion!== undefined && user.religion!=='')html = html + app.getProfileLine("דתי", user.religion);
				//if(user.economy!== undefined && user.economy!=='')html = html + app.getProfileLine("Situación Económica", user.economy);
				//html = html + app.getProfileLine("דתי", user.religion);
				if(user.about!== undefined && user.about!=='' && user.about!=null){
					html = html + app.getProfileGroup("מעט עלי");
					html = html + app.getProfileLine("", user.about);
				}
				if(user.lookingFor!== undefined && user.lookingFor!=='' && user.lookingFor!=null){
					html = html + app.getProfileGroup("אני מחפשת");
					html = html + app.getProfileLine("", user.lookingFor);
				}
				//if((user.hobbies!== undefined && user.hobbies!=='')&&(user.music!== undefined && user.music!=='')){
				//	html = html + app.getProfileGroup("Más información sobre mí");
				//	if(user.hobbies!== undefined && user.hobbies!=='')html = html + app.getProfileLine("Mis intereses", user.hobbies);
				//	if(user.music!== undefined && user.music!=='')html = html + app.getProfileLine("My Music", user.music);
				//}
				detailsContainer.html(html).trigger('create');
				app.stopLoading();				
			}
		});
	},
	
	
	getProfileGroup: function(groupName){
		var group = app.profileGroupTemplate;
		return group.replace("[GROUP_NAME]", groupName);
	},
	
	getProfileLine: function(lineName, lineValue){
		if(lineName != ""){
			var line = app.profileLineTemplate;
			line = line.replace("[LINE_NAME]", lineName);			
		}
		else{
			var line = app.profileLineTemplate2;
		}
		line = line.replace("[LINE_VALUE]", lineValue);
		return line;
	},
	
	getMessenger: function(){		
		app.startLoading();
		app.showPage('messenger_page');
		window.scrollTo(0, 0);
		$.ajax({
			url: 'http://m.kosherdate.co.il/api/v1/user/contacts',									
			success: function(response){
				
				app.response = response;				
				//if(pagesTracker.indexOf('messenger_page')!=-1){
				//	pagesTracker.splice(pagesTracker.length-pagesTracker.indexOf('messenger_page'),pagesTracker.indexOf('messenger_page'));
				//}
				
				app.container = app.currentPageWrapper.find('.chats_wrap');
				app.container.html('');				
				app.template = $('#messengerTemplate').html();
				for(var i in app.response.allChats){
					var currentTemplate = app.template; 
					var chat = app.response.allChats[i];
					currentTemplate = currentTemplate.replace("[IMAGE]",chat.user.mainImage);
					currentTemplate = currentTemplate.replace(/\[USERNICK\]/g,chat.user.nickName);
					currentTemplate = currentTemplate.replace("[RECENT_MESSAGE]",chat.recentMessage.text);
					currentTemplate = currentTemplate.replace("[DATE]", chat.recentMessage.date);					
					currentTemplate = currentTemplate.replace("[USER_ID]", chat.user.userId);
					app.container.append(currentTemplate);
					var currentUserNode = app.container.find(":last-child");
					if(chat.newMessagesCount > 0)currentUserNode.find(".new_mes_count").html(chat.newMessagesCount).show();
					//if(chat.user.isPaying == 1)currentUserNode.find(".special2").show();
					
				}
				app.stopLoading();
			}
		});
	},
	
	getChat: function(chatWith, userNick){
		if(chatWith==window.localStorage.getItem("userId")){app.getMyProfileData(); return;}
		app.chatWith = chatWith;
		app.startLoading();
		$.ajax({
			url: 'http://m.kosherdate.co.il/api/v1/user/chat/'+app.chatWith,									
			success: function(response){				
				app.response = response;
				//alert(JSON.stringify(app.response));
				app.showPage('chat_page');
				window.scrollTo(0, 0);
				app.container = app.currentPageWrapper.find('.chat_wrap');
				app.container.html('');
				app.template = $('#chatMessageTemplate').html();				
				app.currentPageWrapper.find('.content_wrap').find("h1 span").text(userNick).attr('onclick','app.getUserProfile(\''+chatWith+'\')');
				var html = app.buildChat();
				app.container.html(html);
				app.subscribtionButtonHandler();
				app.refreshChat();
				app.stopLoading();
			}
		});
	},
	
	subscribtionButtonHandler: function(){
		if(app.response.chat.abilityReadingMessages == 0){					
			app.container.find('.message_in .buySubscr').show().trigger('create');									
		}
	},
	
	buildChat: function(){
		var html = '';
		var k = 1;
		var appendToMessage = '';
				
		for(var i in app.response.chat.items){					
			var currentTemplate = app.template; 
			var message = app.response.chat.items[i];
			
			if(from == message.from) k--;
			
			if(k % 2 == 0){
				messageFloat = "right";
				info = "info_right";
			} 
			else{				
				messageFloat = "left";
				info = "info_left";
			}
			
			if(app.chatWith == message.from){
				var messageType = "message_in";
				var read = "";
			}
			else{
				var messageType = "message_out";
				var read = '<div class="read_mess '+message.readClass+' '+messageFloat+'"></div>';
			}
			
			currentTemplate = currentTemplate.replace("[MESSAGE]", message.text);
			currentTemplate = currentTemplate.replace("[DATE]", message.date);
			currentTemplate = currentTemplate.replace("[TIME]", message.time);
			currentTemplate = currentTemplate.replace("[MESSAGE_TYPE]", messageType);
			currentTemplate = currentTemplate.replace("[MESSAGE_FLOAT]", messageFloat);
			currentTemplate = currentTemplate.replace("[INFO]", info);
			currentTemplate = currentTemplate.replace("[READ]", read);
			
			html = html + currentTemplate;
			
			var from = message.from;
			
			k++;
		}
		
		return html;
	},	
	
	sendMessage: function(){		
		var message = $('#message').val();		
		if(message.length > 0){
			$('#message').val('');
			app.startLoading();
			$.ajax({
				url: 'http://m.kosherdate.co.il/api/v1/user/chat/'+app.chatWith,
				type: 'Post',
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify({			
					message: message 
				}),
				success: function(response){
					//alert(JSON.stringify(app.response));
				   app.stopLoading();
				   if(app.currentPageId == 'chat_page'){
						app.response = response;
						var html = app.buildChat();
						app.container.html(html);
						app.subscribtionButtonHandler();
						app.refreshChat();
				   }
				}
			});
		
		}
	},
	
	
	refreshChat: function(){
		if(app.currentPageId == 'chat_page'){
			$.ajax({
				url: 'http://m.kosherdate.co.il/api/v1/user/chat/'+app.chatWith+'/refresh',
				type: 'Get',
				complete: function(response, status, jqXHR){					
					//app.stopLoading();
				},
				success: function(response){
				   //alert('3');
					if(response.chat != false){
						if(app.currentPageId == 'chat_page'){
							app.response = response;
							//alert(JSON.stringify(app.response));
							var html = app.buildChat();
							app.container.html(html);	
							app.subscribtionButtonHandler();
							//alert('2');
						}
						//alert('1');
					}
					refresh = setTimeout(app.refreshChat, 100);
					
				}
			});
		}
		else{
			clearTimeout(refresh);
		}
		
	},
	
	checkUserFields: function(name,val){
		if(val.length>2){
			//val = unescape(encodeURIComponent(val));
			//alert(val);

			$.ajax({
				url:'http://m.kosherdate.co.il/api/v1/chekUserFields/'+name+'='+val,
				type:'Get',
				success: function(response){
				   //alert(JSON.stringify(response));
				   if(response){
					app.container.find('.'+name+'State .userOk').hide();
					app.container.find('.'+name+'State .userFailed').show();
					
				   }else{
					app.container.find('.'+name+'State .userOk').show();
					app.container.find('.'+name+'State .userFailed').hide();
				   }
				   app.container.find('#wrong_'+name).val(response);
				}
			});
		}
	},
	
	checkNewMessages: function(){
		if(app.currentPageId != 'login_page'){
		  $.ajax({
			 url: 'http://m.kosherdate.co.il/api/v1/user/newMessagesCount',
			 type: 'Get',
			 complete: function(response, status, jqXHR){
				//app.stopLoading();
			 },
			 success: function(response){
				app.response = response;				
				//alert(app.response.newMessagesCount);
				if(app.response.newMessagesCount > 0){
					app.newMessagesCount = app.response.newMessagesCount;
					//var width = $(document).width();				
					//var pos = width/2 - 30;
					$('.new_mes_count2').html(app.newMessagesCount);
					$('#main_page').addClass('pad_top_25');//css({'padding-top':'25px'});					
					$('.new_mes').show();
					if(app.currentPageId == 'messenger_page'&&app.countMes != app.newMessagesCount){
						//$('.new_mes_count').html(count).show();
				 //alert('1');
						app.getMessenger();
				 //alert('2');
					}					
				}else{
					app.newMessagesCount = 0;
					$('.new_mes').hide();
					$('#main_page').css({'padding-top':'0px'});
					if(app.currentPageId == 'messenger_page'){
						$('.new_mes_count').hide();
					}
				}
				app.countMes = app.newMessagesCount;
				newMesssages = setTimeout(app.checkNewMessages, 10000);
			 }
		  });
		}
		
	},
	
	getSubscription: function(){
		//var userId = window.localStorage.getItem("userId");
		//var ref = window.open('http://m.kosherdate.co.il/subscription/?userId='+userId+'&app=1', '_blank', 'location=yes');
		app.showPage('subscription_page');
		$('input[type="radio"]').removeAttr("checked");
		IAP.initialize();
		
		$(".subscr").click(function(){
			$(".subscr_left").removeClass("subscr_sel");
			$(this).find("input").attr("checked","checked");
			$(this).find(".subscr_left").addClass("subscr_sel");
		});
	},
	
	confirmDeleteImage: function(imageId){
		app.imageId = imageId;		
		navigator.notification.confirm(
				'למחוק את התמונה הזאת?',  // message
		        app.deleteImageChoice,              // callback to invoke with index of button pressed		       
									   'אישור',            // title
									   'אישור, ביטול'           // buttonLabels
		 );
	},
	
	deleteImageChoice: function(buttonPressedIndex){
		if(buttonPressedIndex == 1){
			app.deleteImage();
		}
	},
	
	deleteImage: function(){
		app.requestUrl = 'http://m.kosherdate.co.il/api/v1/user/images/delete/' + app.imageId,
		app.requestMethod = 'Post';
		app.getUserImages();
	},
	
	displayUserImages: function(){
		app.requestUrl = 'http://m.kosherdate.co.il/api/v1/user/images';
		app.requestMethod = 'Get';
		app.getUserImages();
	},
	
	getUserImages: function(){
		$('.imagesButtonsWrap').hide();
		$.ajax({
			url: app.requestUrl,
			type: app.requestMethod,			
			success: function(response){
								
				app.response = response;
				app.showPage('delete_images_page');
				app.container = app.currentPageWrapper.find('.imagesListWrap');
				app.container.html('');
				app.template = $('#editImageTemplate').html();
				window.scrollTo(0,0);
				
				//alert(JSON.stringify(app.response));				
				if(app.response.images.itemsNumber < 4)
					$('.imagesButtonsWrap').show();
				
				for(var i in app.response.images.items){					
					var currentTemplate = app.template; 
					var image = app.response.images.items[i];					
					currentTemplate = currentTemplate.replace("[IMAGE]", image.url);
					currentTemplate = currentTemplate.replace("[IMAGE_ID]", image.id);
					app.container.append(currentTemplate);					
					var currentImageNode = app.container.find('.userImageWrap:last-child');
															
					if(image.isValid == 1)
						currentImageNode.find('.imageStatus').html("אושר").css({"color":"green"});
					else						
						currentImageNode.find('.imageStatus').html("עדיין לא אושר").css({"color":"red"});
					
				}
				
				app.container.trigger('create');
			}
		});
	},
	
	capturePhoto: function(sourceType, destinationType){
		// Take picture using device camera and retrieve image as base64-encoded string	
		var options = {
			quality: 100, 
			destinationType: app.destinationType.FILE_URI,
			sourceType: sourceType,
			encodingType: app.encodingType.JPEG,
			targetWidth: 600,
			targetHeight: 600,		
			saveToPhotoAlbum: false,
			chunkedMode:true,
			correctOrientation: true
		};
		
		navigator.camera.getPicture(app.onPhotoDataSuccess, app.onPhotoDataFail, options);
		
	},
	
	onPhotoDataSuccess: function(imageURI) {		
		app.startLoading();
		
		/*
		$("#myNewPhoto").attr("src","data:image/jpeg;base64," + imageURI);
		$('#myNewPhoto').Jcrop({
			onChange: showPreview,
			onSelect: showPreview,
			aspectRatio: 1
		});
		*/
		app.uploadPhoto(imageURI); 
	},
	
	onPhotoDataFail: function() {
		
	},
	
	uploadPhoto: function(imageURI){
		var user = window.localStorage.getItem("user");
		var pass = window.localStorage.getItem("pass");		
		var options = new FileUploadOptions();
        options.fileKey="file";
        options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
        options.mimeType="image/jpeg";
        options.headers = {"Authorization": "Basic " + btoa ( user + ":" + pass)}; 
        
        var ft = new FileTransfer();
        ft.upload(
        	imageURI, 
        	encodeURI("http://m.kosherdate.co.il/api/v1/user/image"), 
        	app.uploadSuccess, 
        	app.uploadFailure,
	        options
	    );
	},
	
	
	uploadSuccess: function(r){
		//console.log("Code = " + r.responseCode);
        //console.log("Response = " + r.response);
        //console.log("Sent = " + r.bytesSent);
        
		//alert(r.response);
        //return;
		
		app.stopLoading();
		
		app.response = JSON.parse(r.response);
		if(app.response.status.code == 0){
			navigator.notification.confirm(
				app.response.status.message + ' לחצו על כפתור "נהל תמונות" על מנת למחוק תמונות',  // message
				app.manageImagesChoice,              // callback to invoke with index of button pressed
					   'Notification',            // title
										   'נהל תמונות,ביטול'          // buttonLabels
			);
		}else if(app.response.status.code == 1){
			app.alert(app.response.status.message);
		}
		
		if(app.currentPageId == 'delete_images_page'){
			app.displayUserImages();
		}
		
	},
	
	manageImagesChoice: function(buttonPressedIndex){
		if(buttonPressedIndex == 1){
			app.displayUserImages();
		}
	},
	
	
	uploadFailure: function(error){
		app.stopLoading(); 
		alert("התרחשה שגיאה. נסה שנית בבקשה.");
	},
	
	
	register: function(){		
		app.showPage('register_page');
		$('#header, #beforeHead').css({"position":"absolute"});
		$('#birthDate').html(app.getBithDate()).trigger('create');
		//app.getCountries();
		app.getRegions();
		app.getReligions();
		//app.getCities();
		//app.getSexPreference();
	},
	
	contactUs: function(){
		window.scrollTo(0, 0);
		app.showPage('contact_page');
	},
	
	
	sendContactForm: function(){
	
		if(!$('#contactEmail').val().length){
			alert('דוא"ל אינו תקין');
			return false;
		}
	
		if(!$('#contactSubject').val().length){
			alert('נושא אינו תקין');
			return false;
		}
	
		if(!$('#contactText').val().length){
			alert('הודעה אינה תקינה');
			return false;
		}
	
		var data = $('#contactForm').serializeObject();
	
		$.ajax({
			url: 'http://m.kosherdate.co.il/api/v1/user/contact',
			type: 'Post',
			data: JSON.stringify(data),
			error:function(response){
			   //alert(JSON.stringify(response));
			},
			success: function(response){
			   if(response.contact == "1"){
					alert('הודעה נשלחה בהצלחה');
					$('#contactEmail').val("");
					$('#contactSubject').val("");
					$('#contactText').val("");
					var prevPage = pagesTracker[pagesTracker.length-2];
					if(prevPage != 'prompt_to_subscr_page'){
						app.chooseMainPage();
					}
					else{
						app.back();
					}
			   }
			   else if(response.contact == "-1"){
					alert('דוא"ל אינו תקין');
			   }
			}
		});
	},
	
	
	
	getBithDate: function(){
		var html;		
		html = '<div class="left">';
			html = html + '<select name="userBirthday_d" id="d" data-iconpos="left">';
				html = html + '<option value="">יום</option>';
				for (var i = 1; i <= 31; i++) {
					html = html + '<option value="' + i + '"';
					if(app.currentPageId == 'edit_profile_page'&&i==app.response.j)
						html = html + ' selected="selected" ';
					html = html + '>' + i + '</option>';
				}		
			html = html + '</select>';		
		html = html + '</div>';
				
		html = html + '<div class="left">';
			html = html + '<select name="userBirthday_m" id="m" data-iconpos="left">';
				html = html + '<option value="">חודש</option>';
				for (var i = 1; i <= 12; i++) {
					html = html + '<option value="' + i + '"';
					if(app.currentPageId == 'edit_profile_page'&&i==app.response.n)
						html = html + ' selected="selected" ';
					html = html + '>' + i + '</option>';
				}		
			html = html + '</select>';		
		html = html + '</div>';
						
		var curYear = new Date().getFullYear();
		
		html = html + '<div class="left">';
			html = html + '<select name="userBirthday_y" id="y" data-iconpos="left">';
				html = html + '<option value="">שנה</option>';
				for (var i = curYear - 18; i >=1940 ; i--) {
					html = html + '<option value="' + i + '"';
					if(app.currentPageId == 'edit_profile_page'&&i==app.response.Y)
						html = html + ' selected="selected" ';
					html = html + '>' + i + '</option>';
				}		
			html = html + '</select>';	
		html = html + '</div>';
		
		return html;
	},
	
		
	dump: function(obj) {
	    var out = '';
	    for (var i in obj) {
	        out += i + ": " + obj[i] + "\n";
	    }
	    alert(out);
	}	
	
		
};


document.addEventListener("deviceready", app.init, false);

function showPreview(coords)
{
	var rx = 100 / coords.w;
	var ry = 100 / coords.h;

	$('#preview').css({
		width: Math.round(rx * 500) + 'px',
		height: Math.round(ry * 370) + 'px',
		marginLeft: '-' + Math.round(rx * coords.x) + 'px',
		marginTop: '-' + Math.round(ry * coords.y) + 'px'
	});
}


$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};


function onBodyLoad(){
	//initFastButtons();
	document.addEventListener("deviceready", app.init, false);
}


window.addEventListener('load', function() {
	new FastClick(document.body);
}, false);


//======================================================== FASTCLICK
function FastButton(element, handler) {
   this.element = element;
   this.handler = handler;
   element.addEventListener('touchstart', this, false);
};
FastButton.prototype.handleEvent = function(event) {
   switch (event.type) {
      case 'touchstart': this.onTouchStart(event); break;
      case 'touchmove': this.onTouchMove(event); break;
      case 'touchend': this.onClick(event); break;
      case 'click': this.onClick(event); break;
   }
};
FastButton.prototype.onTouchStart = function(event) {

event.stopPropagation();
   this.element.addEventListener('touchend', this, false);
   document.body.addEventListener('touchmove', this, false);
   this.startX = event.touches[0].clientX;
   this.startY = event.touches[0].clientY;
isMoving = false;
};
FastButton.prototype.onTouchMove = function(event) {
   if(Math.abs(event.touches[0].clientX - this.startX) > 10 || Math.abs(event.touches[0].clientY - this.startY) > 10) {
      this.reset();
   }
};
FastButton.prototype.onClick = function(event) {
   this.reset();
   this.handler(event);
   if(event.type == 'touchend') {
      preventGhostClick(this.startX, this.startY);
   }
};
FastButton.prototype.reset = function() {
   this.element.removeEventListener('touchend', this, false);
   document.body.removeEventListener('touchmove', this, false);
};
function preventGhostClick(x, y) {
   coordinates.push(x, y);
	//alert('1');
   window.setTimeout(gpop, 2500);
};
function gpop() {
   coordinates.splice(0, 2);
};
function gonClick(event) {
   for(var i = 0; i < coordinates.length; i += 2) {
      var x = coordinates[i];
      var y = coordinates[i + 1];
      if(Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
         event.stopPropagation();
         event.preventDefault();
      }
   }
};
document.addEventListener('click', gonClick, true);
var coordinates = [];
function initFastButtons() {
new FastButton(document.getElementById("mainContainer"), goSomewhere);
};
function goSomewhere() {
var theTarget = document.elementFromPoint(this.startX, this.startY);
if(theTarget.nodeType == 3) theTarget = theTarget.parentNode;

var theEvent = document.createEvent('MouseEvents');
theEvent.initEvent('click', true, true);
theTarget.dispatchEvent(theEvent);
};
//========================================================
