/* Original JavaScript code by Chirp Internet: www.chirp.com.au
 Modified by Musuda Alitsi dmusuda@gmail.com on 02-March-2017
 
 Please acknowledge use of this code by including this header.
 SHRT - Search_Highlight_Replace_Text
 parameters 
		id = the id of the tag you want searched
		tag= the tag you want used for highlighting
		
 URL  - https://github.com/mashtullah/Search_Highlight_Replace_Text
 Demo - https://mashtullah.github.io/Search_Highlight_Replace_Text/
 
 
 */

function SHRT(id, tag)
{

  var targetNode = document.getElementById(id) || document.body;
  var hiliteTag = tag || "EM";
  var skipTags = new RegExp("^(?:" + hiliteTag + "|SCRIPT|FORM|SPAN)$");
  var colors = ["#ff6", "#a0ffff", "#9f9", "#f99", "#f6f"];
  var wordColor = [];
  var colorIdx = 0;
  var matchRegex = "";
  var openLeft = false;
  var openRight = false;
  var words=[];
  var replacedWords=[];
  var replacedNodes=[];
  var regIndex=[];
  var regIndex_=[];
  var replaceString="";
  
  var replacedWords_=[];
  var replacedNodes_=[];
  var c=0;
  var currentWordReplaced=false;
  // characters to strip from start and end of the input string
  var endCharRegex = new RegExp("^[^\\\w]+|[^\\\w]+$", "g");

  // characters used to break up the input string into words
  var breakCharRegex = new RegExp("[^\\\w'-]+", "g");

  this.setMatchType = function(type)
  {
    switch(type)
    {
      case "left":
        this.openLeft = false;
        this.openRight = true;
        break;

      case "right":
        this.openLeft = true;
        this.openRight = false;
        break;

      case "open":
        this.openLeft = this.openRight = true;
        break;

      default:
        this.openLeft = this.openRight = false;

    }
  };

  this.setRegex = function(input)
  {
    input = input.replace(endCharRegex, "");
    input = input.replace(breakCharRegex, "|");
    input = input.replace(/^\||\|$/g, "");
    if(input) {
      var re = "(" + input + ")";
      if(!this.openLeft) re = "\\b" + re;
      if(!this.openRight) re = re + "\\b";
      matchRegex = new RegExp(re, "i");
	  words=input.split('|');
      return true;
    }
    return false;
  };

  this.getRegex = function()
  {
    var retval = matchRegex.toString();
    retval = retval.replace(/(^\/(\\b)?|\(|\)|(\\b)?\/i$)/g, "");
    retval = retval.replace(/\|/g, " ");
    return retval;
  };

  // recursively apply word highlighting
  this.hiliteWords = function(node)
  {
    if(node === undefined || !node) return;
    if(!matchRegex) return;
    if(skipTags.test(node.nodeName)) return;

    if(node.hasChildNodes()) {
      for(var i=0; i < node.childNodes.length; i++)
        this.hiliteWords(node.childNodes[i]);
    }
    if(node.nodeType == 3) { // NODE_TEXT
      if((nv = node.nodeValue) && (regs = matchRegex.exec(nv))) {
        if(!wordColor[regs[0].toLowerCase()]) {
          wordColor[regs[0].toLowerCase()] = colors[colorIdx++ % colors.length];
        }		
        var match = document.createElement(hiliteTag);
        match.appendChild(document.createTextNode(regs[0]));		
		match.style.backgroundColor = wordColor[regs[0].toLowerCase()];
		match.style.fontStyle = "inherit";
		match.style.color = "#000";      

        var after = node.splitText(regs.index);
        after.nodeValue = after.nodeValue.substring(regs[0].length);
        node.parentNode.insertBefore(match, after);
      }
    };
  };

  // recursively  replace words
  this.replaceWords = function(node,rp,ind_=0)
  {
    if(node === undefined || !node) return;
    if(!matchRegex) return;
    if(skipTags.test(node.nodeName)) return;

    if(node.hasChildNodes()) {
      for(var i=0; i < node.childNodes.length; i++)
        this.replaceWords(node.childNodes[i],rp);
    }
    if(node.nodeType == 3) { 
      if((nv = node.nodeValue) && (regs = matchRegex.exec(nv))) {
		  
        if(!wordColor[regs[0].toLowerCase()]) {
          wordColor[regs[0].toLowerCase()] = colors[colorIdx++ % colors.length];
        }
		var rp_="";
		if(regs[0]==words[c])
		{
			if(c<words.length)
			{
				if(!currentWordReplaced){
					rp_=rp;
					currentWordReplaced=true;
				} 
				var match = document.createElement(hiliteTag);
				match.appendChild(document.createTextNode(rp_));
				match.style.fontStyle = "inherit";
				
				if(ind_==0)
					var after = node.splitText(regs.index);	
				else
					var after = node.splitText(ind_);						
				after.nodeValue = after.nodeValue.substring(regs[0].length);			
				node.parentNode.insertBefore(match, after);
				replacedWords.push(regs[0]);
				replacedNodes.push(node);
				regIndex.push(regs.index);
				
			}
			c++;
			if(c==words.length)
			{
				replacedWords=[];
				replacedNodes=[];
				regIndex=[];
				c=0;
				currentWordReplaced=false;
			}
		}
		else{			
				if(c>0){
					replacedWords_.push(replacedWords.join(" "));	
					replacedNodes_.push(replacedNodes[0]);
					regIndex_.push(regIndex[0]);				
					replacedWords=[];
					replacedNodes=[];
					regIndex=[];
					c=0;
				}
				rp_=rp;
				currentWordReplaced=false;
				var match = document.createElement(hiliteTag);
				match.appendChild(document.createTextNode(rp_));
				match.style.fontStyle = "inherit";
				var after = node.splitText(regs.index);
				after.nodeValue = after.nodeValue.substring(regs[0].length);
				node.parentNode.insertBefore(match, after);
				replacedWords.push(regs[0]);
				replacedNodes.push(node);	
				regIndex.push(regs.index);
				currentWordReplaced=true;
				if(regs[0]!=words[0]){
				replacedWords_.push(replacedWords.join(" "));	
				replacedNodes_.push(replacedNodes[0]);
				regIndex_.push(regIndex[0]);					
				}
				c++;			
			
		}
					    
      }
    };
  };
  
  
  // remove highlighting
  this.remove = function()
  {
    var arr = document.getElementsByTagName(hiliteTag);
    while(arr.length && (el = arr[0])) {
      var parent = el.parentNode;
      parent.replaceChild(el.firstChild, el);
      parent.normalize();
    }
  };

  // start highlighting at target nodes
  this.apply = function(input)
  {
    this.remove();
    if(input === undefined || !input) return;
    if(this.setRegex(input)) {
      this.hiliteWords(targetNode);
    }
  };
  
  // start replacing text at target nodes
  this.replace = function(input,rp)
  {
    this.remove();
    if(input === undefined || !input) return;
    if(this.setRegex(input)) {
		replaceString=rp;
      this.replaceWords(targetNode,rp);
    }
	if(c>0){
			replacedWords_.push(replacedWords.join(" "));	
			replacedNodes_.push(replacedNodes[0]);
			regIndex_.push(regIndex[0]);					
				}
	for(var i=0; i <replacedNodes_.length; i++)
	{
		this.setRegex(replaceString);
		var match = document.createElement(hiliteTag);
		match.appendChild(document.createTextNode(replacedWords_[i]));
		match.style.fontStyle = "inherit";
		var after = replacedNodes_[i].splitText(regIndex_[i]);
		after.nodeValue = after.nodeValue.substring(replacedWords_[i].length);
		replacedNodes_[i].parentNode.insertBefore(match, after);
		after.nextSibling.remove();
	}
  };
  
  

}
