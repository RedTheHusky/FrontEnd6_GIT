/*@1.Tamas*/

/*Requested this 
	<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/sha256.js"></script>  //password generation 
	<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js"></script>	//encrypting the cash value whit the non-hash value of the password
in HTML file*/
function AccountData(options={}) {
	var protecteds=options;
	protecteds.uuid = options.uuid ;
	protecteds.hashedPassword = options.hashedPassword ;
	protecteds.cash = options.cash;
	protecteds.name = options.name;
	protecteds.hasAccess= function(taskName,options,data){
		//console.log(taskName,'hasAccess:options=',options);
		//console.log(taskName,'hasAccess:data=',data);
		function arraysEqual(taskName,a,b){
			//console.log(taskName,'arraysEqual:a=',a);
			//console.log(taskName,'arraysEqual:b=',b);
			if (a === b) { 
				//console.log(taskName,'arraysEqual:return 1');
				return true;
			}
			if (a == null || b == null) {
				//console.log(taskName,'arraysEqual:return 2');
				return false;
			}
			if (a.length != b.length) {
				//console.log(taskName,'arraysEqual:return 3');
				return false;
			}
			for (var i = 0; i < a.length; ++i) {
				//console.log(taskName,'arraysEqual:i='+i+", a?b="+a[i]+"/"+b[i]);
				if (a[i] !== b[i]) {
					//console.log(taskName,'arraysEqual:return 4');
					return false;
				}
			}
			//console.log(taskName,'arraysEqual:return 5');
			return true;
		}

		var accessPassword='';
		if(options.accessPassword){
			//console.log(taskName,'hasAccess:options.accessPassword=',options.accessPassword);
			accessPassword=options.accessPassword;
		}else if(options.password){
			//console.log(taskName,'hasAccess:options.password=',options.password);
			accessPassword=options.password;
		}else{
			//console.log(taskName,'hasAccess:accessPassword=None');
			return {task:taskName, status:false, text:'No password option was given!'};
		}
		accessPassword=accessPassword.toString();
		accessPassword=accessPassword.trim();
		if(accessPassword.length<4){
			//console.log(taskName,'hasAccess:accessPassword=Too short');
			return {task:taskName, status:false, text:'Password is too short!'};
		}
		//console.log(taskName,'hasAccess:accessPassword=',accessPassword);
		var hashedAccessPassword=CryptoJS.SHA256(accessPassword);
		hashedAccessPassword=hashedAccessPassword.words;		
		//console.log(taskName,'hasAccess:hashedAccessPassword=',hashedAccessPassword);
		//console.log(taskName,'hasAccess:data.hashedPassword=',data.hashedPassword);
		var isEqual=arraysEqual(taskName,hashedAccessPassword,data.hashedPassword);
		//console.log(taskName,'hasAccess:isEqual=',isEqual);
		if(isEqual){
			return {task:taskName, status:true, text:'Password OK'};
		}else{
			return {task:taskName, status:false, text:'Invalid password!'};
		}
	}
	protecteds.decryptValue =function(taskName,data,options){
		//console.log(taskName,'decryptValue:data=',data);
		//console.log(taskName,'decryptValue:options=',options);
		var accessPassword='';
		if(options.accessPassword){
			accessPassword=options.accessPassword;
		}else if(options.password){
			accessPassword=options.password;
		}
		var deVal=CryptoJS.AES.decrypt(data,accessPassword);
		deVal=deVal.toString(CryptoJS.enc.Utf8);
		return deVal;
	}
}
function Account(options={}) {
    var data = {};
	//data=options;
	function uuid() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		  });
	}
	
	data.uuid=uuid();
	if(!options.password){
		options.password='0000';
	}else{
		options.password=options.password.toString();
		options.password=options.password.trim();
		if(options.password.length<4){
			options.password='0000';
		}
	}
	data.name=options.name.toString();
	data.cash=options.cash.toString();
	//console.log('data.name=',data.name);
	//console.log('data.cash=',data.cash);
	//console.log('encrypt:data.name=',data.name);
	//console.log('encrypt:password=',options.password);
	data.cash = CryptoJS.AES.encrypt(data.cash, options.password);

	data.hashedPassword=CryptoJS.SHA256(options.password);
	data.hashedPassword=data.hashedPassword.words;
    var protected = new AccountData(data); 
	//Scope Block
	//With the DevTool it can be accessed, thats why i used sha256 to encyrted the password and aes to encryted the cash.
	//Even if its accessed via the DevTool, its still encyrted. 
	protected.debugPrint = function(options={}){
		var json=data.hasAccess('@debugPrint',options,data);
		if(json.status){
			//console.log('json=2');
			var json={};
			json.cash=data.decryptValue('@debugPrint',data.cash,options);
			json.uuid=data.uuid;
			json.name=data.name;
			return json;
		}else{
			//console.log('json=1');
			var json={};
			json.uuid=data.uuid;
			json.name=data.name;
			return json;
		}
		
	}
	protected.getUUID = function(options={}){
		return data.uuid;
	};
	protected.getName = function(options={}){
		var accessPassword='';
		return data.name;
	};
	protected.setName = function(options={}){
		var json=data.hasAccess('@setName',options,data);
		if(json.status){
			var oldName=data.name;
			data.name=options.name || 'Jonh Smit';
			return '@setName|Success|'+oldName+"|"+ data.name;
		}else{
			return '@setName|'+json.text;
		}
	};
	protected.getCash = function(options={}){
		var json=data.hasAccess('@getCash',options,data);
		if(json.status){
			return data.decryptValue('@debugPrint',data.cash,options);
		}else{
			return '@getCash|'+json.text;
		}
	};
	protected.setCash = function(options={}){
		var json=data.hasAccess('@setCash',options,data);
		if(json.status){
			var oldCash=data.decryptValue('@setCash',data.cash,options);
			var newCash=options.cash || '0';
			var accessPassword='';
			if(options.accessPassword){
				accessPassword=options.accessPassword;
			}else if(options.password){
				accessPassword=options.password;
			}
			data.cash=data.cash = CryptoJS.AES.encrypt(newCash.toString(), accessPassword);
			return '@setCash|Success|'+oldCash+"|"+ newCash;
		}else{
			return '@setCash|'+json.text;
		}
	};
	protected.addCash = function(options={}){
		var json=data.hasAccess('@addCash',options,data);
		if(json.status){
			if(!options.cash){
				return '@addCash|'+"Cash is not defined";
			}
			if(typeof options.cash != 'number'){
				return '@addCash|'+"Cash is not defined";
			}
			if(options.cash<0){
				return '@addCash|'+"Invalid, can't add negative amount";
			}
			var oldCash=data.decryptValue('@addCash',data.cash,options);
			oldCash=Number(oldCash);
			options.cash=Number(options.cash);
			var newCash=oldCash+options.cash;
			var accessPassword='';
			if(options.accessPassword){
				accessPassword=options.accessPassword;
			}else if(options.password){
				accessPassword=options.password;
			}
			data.cash=data.cash = CryptoJS.AES.encrypt(newCash.toString(), accessPassword);
			return '@addCash|Success|'+oldCash+"+"+options.cash+"="+newCash;
		}else{
			return '@addCash|'+json.text;
		}
	};
	protected.subCash = function(options={}){
		var json=data.hasAccess('@subCash',options,data);
		if(json.status){
			if(!options.cash){
				return '@subCash|'+"Cash is not defined";
			}
			if(typeof options.cash != 'number'){
				return '@subCash|'+"Cash is not defined";
			}
			if(options.cash<0){
				return '@subCash|'+"Invalid, can't subtract negative amount";
			}
			var oldCash=data.decryptValue('@subCash',data.cash,options);
			var newCash=oldCash-options.cash;
			var accessPassword='';
			if(options.accessPassword){
				accessPassword=options.accessPassword;
			}else if(options.password){
				accessPassword=options.password;
			}
			data.cash=data.cash = CryptoJS.AES.encrypt(newCash.toString(), accessPassword);
			return '@subCash|Success|'+oldCash+"-"+options.cash+"="+newCash;
		}else{
			return '@subCash|'+json.text;
		}
	};
	protected.setPassword = function(options={}){
		var json=data.hasAccess('@setPassword',options,data);
		if(json.status){
			var newPassword=options.newPassword;
			newPassword=newPassword.trim();
			if(newPassword.length<4){
				return '@setPassword|New Password is too short!';
			}
			var hashedNewPassword=CryptoJS.SHA256(newPassword);
			hashedNewPassword=hashedNewPassword.words;
			//console.log('@setPassword|hashedNewPassword',hashedNewPassword);
			var oldCash=data.decryptValue('@setPassword',data.cash,options);
			data.cash=data.cash = CryptoJS.AES.encrypt(oldCash, newPassword);
			data.hashedPassword=hashedNewPassword;
			return '@setPassword|Success';
		}else{
			return '@setPassword|'+json.text;
		}
	};
	// replaces Account with AccountData
	return protected;
}

 
var account = new Account({name:'Anna',password:'1234', cash:25});
//account.debugPrint();
console.log('1',account.debugPrint({password:'ujku'}));
console.log('2',account.debugPrint({password:'1234'}));
console.log('3',account.getCash({password:'1234'})); 
console.log('4',account.setCash({password:'1234', cash:30})); 
console.log('5',account.getCash({password:'1234'})); 
console.log('6',account.addCash({password:'1234', cash:10})); 
console.log('7',account.getCash({password:'1234'})); 
console.log('8',account.subCash({password:'1234', cash:5})); 
console.log('9',account.getCash({password:'1234'})); 
console.log('10',account.setPassword({password:'1234', newPassword:'2345'})); 
console.log('11',account.getCash({password:'1234'})); 
console.log('12',account.getCash({password:'2345'})); 
console.log(account); 
//console.log('13',protecteds); //index.js:268 Uncaught ReferenceError: protecteds is not defined
//console.log('14',data); //index.js:269 Uncaught ReferenceError: data is not defined
