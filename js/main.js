currentp = null;
historyp = null;
temp = {};
minutes=1000*60;
hours=minutes*60;
days=hours*24;
years=days*365;
flagpart = !(typeof chrome =="undefined" || typeof chrome.storage =="undefined");
if(flagpart){
  storage = chrome.storage.local;
}else{
  storage = $.localStorage;
}
popcount = 0;
undones = {};
$(document).ready(function(){
    if($(window).width()>500){
        var popUp = window.open('index.html', 'newwindow', 'height=568, width=320, top=50, left=500, toolbar=no, menubar=no, resizable=no,location=no, status=no');
        if (popUp == null || typeof(popUp)=='undefined') {
            showpop('Please disable your pop-up blocker and click the "Open" link again.');
        }
        else {
            popUp.focus();
        }
    }
    $('div.setddl').css('top',$(document).height()-175);
    $('div.save').css('top',$(document).height()-88);
    $('div.timeinfo').css('top',$(document).height()-130);
    $('div.cupromise div.serp').css('top',$(document).height()-142);
    $('div.button').css('top',$(document).height()-55);
    $('div.clear').css('top',$(document).height()-45);
    $('div.savetime').css('top',$(document).height()-135);

    showquotes();
    setTimeout(function() {
      if(flagpart){
        storage.get("currentpromise", function(data) {
            if(data.currentpromise){
                $('div.loading').fadeOut(500).siblings('div.cupromise').fadeIn(800);
                showcur(data.currentpromise);
            }else{
                $('div.loading').fadeOut(500).siblings('div.addpromise').fadeIn(800);
            }
        });
      }else{
        var data = storage.get('currentpromise');
        if(data){
            $('div.loading').fadeOut(500).siblings('div.cupromise').fadeIn(800);
            showcur(data);
        }else{
            $('div.loading').fadeOut(500).siblings('div.addpromise').fadeIn(800);
        }
      }
    }, 3000);
    // DONE: optimize the date picker
    $('#datetimepicker').datetimepicker({
      format: 'yyyy-MM-dd hh:mm:ss',
      language: 'pt-BR'
    });
    $('div.helpuse').on('click',function(){
      $(this).hide();
      $('#newpromise').css('display','block')
      $('#newpromise').trigger('click');
    });
    $('#newpromise').on('click',function(){
      if(flagpart){
        storage.get("undones", function(data) {
            if(data.undones){
              var mes = "All delayed Items: <ul>";
              $.each(data.undones,function(i,v){
                if(v>0){
                  mes += "<li>"+i+"<span>Del</span></li>";
                }
              })
              if(mes!="All delayed Items: <ul>"){
                notifshow(mes+"</ul>");
              }
            }
        });
      }else{
        var data = storage.get('undones');
        if(data){
            if(data){
              var mes = "All delayed Items: <ul>";
              $.each(data,function(i,v){
                if(v>0){
                  mes += "<li>"+i+"<span>Del</span></li>";
                }
              })
              if(mes!="All delayed Items: <ul>"){
                notifshow(mes+"</ul>");
              }
            }
        }
      }
    })
    $('body').on('click','div.notiflayer span',function(){
      var key = $(this).closest('li').text().replace('Del','');
      savesingle("undones",key,0);
      $(this).closest('li').fadeOut(500).remove();
      if($('div.notiflayer').find('li').length==0){
        $('div.notiflayer').hide();
      }
    });
    $('div.save').on('click',function(){
        var cupromise = {};
        cupromise.content = $('textarea').val();
        cupromise.addtime = new Date();
        cupromise.deadline = $('input#theddl').val().replace(" ","T")+'+0800';
        if(cupromise.deadline == ""){showpop('invalid date');return};
        if(Date.parse(cupromise.deadline)-Date.parse(new Date()) >= (1000*60*60*24*5)){showpop('Your deadline should be in 5 days from now on.');return};
        if(Date.parse(cupromise.deadline)-Date.parse(new Date()) <= 0){showpop('Your deadline must be later than now.');return};
        storage.set({"currentpromise":cupromise});
        $('div.addpromise').fadeOut(800).siblings('div.cupromise').fadeIn(800);
        showcur(cupromise);
        $('div.notiflayer').hide();
    });
    // DONE: log some information for checkbox in localstorage.
    $('div.showpromise').on('click','input',function(){
      var mark = ($(this).prop('checked'))?1:0;
      var imark = $('input').index($(this));
      savesingle("marks",imark,mark);
    });
    // move promise to history
    $('div.button').on('click','div',function(){
      // DONE: add a check part--for todo list.
      // TODO: Rule 1: Delay item need automatic added to next promise and never should delay for 3 times.
      var flag = $(this).attr('data-name');
      // var dateflag = (new Date()).toISOString();
      if($('div.showpromise input[type=checkbox]').length>0){
        var i = 0;
        $.each($('div.showpromise input[type=checkbox]'),function(index,v){
          if(!$(v).prop('checked')){
            i++;
          }
        });
        if(i>0 && flag=="mdone" && popcount<2){
          showpop("You have "+i+" "+(i==1?"item":"items")+" did not mark as done. Try "+(2-popcount)+" more times to skip it.");
          popcount ++;
        }else{
          gotohistory(flag);
        }
      }else{
        gotohistory(flag);
      }
    });
    $('div.cupromise').on('click','div.right,div.left',function(){
        $('div.cupromise').fadeOut(500).siblings('div.oldpromise').fadeIn(800);
        showhis();
    });
    $('div.oldpromise').on('click','div.right,div.left',function(){
      if(flagpart){
        storage.get("currentpromise", function(data) {
            if(data.currentpromise){
                $('div.oldpromise').fadeOut(500).siblings('div.cupromise').fadeIn(800);
            }else{
                $('div.oldpromise').fadeOut(500).siblings('div.addpromise').fadeIn(800);
            }
        });
      }else{
        var data = storage.get("currentpromise");
        if(data){
            $('div.oldpromise').fadeOut(500).siblings('div.cupromise').fadeIn(800);
        }else{
            $('div.oldpromise').fadeOut(500).siblings('div.addpromise').fadeIn(800);
        }
      }
    });
    $('div.addpromise').on('click','div.right,div.left',function(){
      if(flagpart){
        storage.get("currentpromise", function(data) {
            if(data.currentpromise){
                $('div.addpromise').fadeOut(500).siblings('div.cupromise').fadeIn(800);
            }else{
                $('div.addpromise').fadeOut(500).siblings('div.oldpromise').fadeIn(800);
                showhis();
            }
        });
      }else{
        var data = storage.get("currentpromise");
        if(data){
            $('div.addpromise').fadeOut(500).siblings('div.cupromise').fadeIn(800);
        }else{
            $('div.addpromise').fadeOut(500).siblings('div.oldpromise').fadeIn(800);
            showhis();
        }
      }
    });
    $('div.clear').on('click',function(){
      if(flagpart){
        storage.remove("historypromise", function() {
            console.log('Cleared all histories.')
            showhis();
        });
      }else{
        storage.remove("historypromise");
        showhis();
      }
    });
    //DONE: add review for history item.
    $('div.histories').on('click','ul.items li',function(){
        $('div.review').toggle();
        $(this).siblings().toggle();
        var index = $('div.histories ul.items li').index($(this));
        if(flagpart){
          storage.get("historypromise", function(data) {
              var his = data.historypromise;
              if(his[index].content.indexOf("MD:")==0){
                var converter = new Markdown.Converter(),
                    markdownToHtml = converter.makeHtml;
                $('div.review').html(markdownToHtml(his[index].content.replace("MD:","")));
              }else{
                $('div.review').html(his[index].content.replace(/\n/g,"\<br\>"));
              }
          });
        }else{
          var data = storage.get("historypromise");
          if(data[index].content.indexOf("MD:")==0){
            var converter = new Markdown.Converter(),
                markdownToHtml = converter.makeHtml;
            $('div.review').html(markdownToHtml(data[index].content.replace("MD:","")));
          }else{
            $('div.review').html(data[index].content.replace(/\n/g,"\<br\>"));
          }
        }
    });
    // update the ddl time information
    setInterval(function() {
      if(flagpart){
        storage.get("currentpromise", function(data) {
            if(data.currentpromise){
                showcur(data.currentpromise);
            }else{
                return
            }
        });
      }else{
        var data = storage.get("currentpromise");
        if(data){
            showcur(data);
        }else{
            return
        }
      }
    },60000);
});
function showcur(kk){
    // parse some special formation:
    if(kk.content.indexOf("MD:")==0){
      var converter = new Markdown.Converter(),
          markdownToHtml = converter.makeHtml;
      $('div.showpromise').html(markdownToHtml(kk.content.replace("MD:","")));
    }else{
      $('div.showpromise').html(kk.content.replace(/\n/g,"\<br\>"));
    }
    $('div.ddl span.time').text(kk.deadline);
    var remaintime =Date.parse(kk.deadline)-Date.parse(new Date());
    if(remaintime>3*days){
        flag = "long";
    }else if(remaintime>2*days){
        flag = "twoday";
    }else if(remaintime>1*days){
        flag = "oneday";
    }else if(remaintime>12*hours){
        flag = "halfday";
    }else if(remaintime>0){
        flag = "soon";
    }else if(remaintime<0){
        flag = "fail";
        remaintime =  Math.abs(remaintime);
    }
    showthis(remaintime,flag);
}
function showthis(remaintime,flag){
    $('div.remain span.time').html("<b class="+flag+">"+Math.floor(remaintime/days) + "days " + Math.floor((remaintime-(Math.floor(remaintime/days))*days)/hours) + "hours " + Math.floor((remaintime-(Math.floor(remaintime/hours))*hours)/minutes)+"mins</b>");
    showmarks();
}
// show marks after load all data
function showmarks(){
  if(flagpart){
    storage.get("marks", function(data) {
      $.each(data.marks,function(i,v){
          $('input').eq(parseInt(i)).prop('checked',((v==1)? true:false));
      });
    })
  }else{
    var data = storage.get("marks");
    $.each(data,function(i,v){
        $('input').eq(parseInt(i)).prop('checked',((v==1)? true:false));
    });
  }
}
function showhis(){
    $('div.review').hide();
    $('ul.items').empty();
    if(flagpart){
      storage.get("historypromise", function(data) {
          var his = data.historypromise;
          var savedtime = 0;
          if(his != null){
              $.each(his,function(index,value){
                // remove the 'MD:' for summary
                  var summ = value.content.split("\n")[0];
                  if(value.content.indexOf("MD:")==0){
                      summ = value.content.split("\n")[1];
                  }
                  $('ul.items').append("<li class="+value.status+"><span>"+value.closetime.split("GMT")[0]+"</span><span>"+value.status+"</span><div class="+value.status+"></div><div class=summary>"+summ+"</div></li>");
                  if(value.status == 'done' || value.status == 'delay'){
                      savedtime = savedtime +  Date.parse(value.deadline)-Date.parse(value.closetime);
                  }
              });
          }
          $('div.savetime').find('span').text(Math.floor(savedtime/(1000*3600*24))+"days");
      });
    }else{
      var his = storage.get("historypromise");
      var savedtime = 0;
      if(his != null){
          $.each(his,function(index,value){
            // remove the 'MD:' for summary
              var summ = value.content.split("\n")[0];
              if(value.content.indexOf("MD:")==0){
                  summ = value.content.split("\n")[1];
              }
              $('ul.items').append("<li class="+value.status+"><span>"+value.closetime.split("GMT")[0]+"</span><span>"+value.status+"</span><div class="+value.status+"></div><div class=summary>"+summ+"</div></li>");
              if(value.status == 'done' || value.status == 'delay'){
                  savedtime = savedtime +  Date.parse(value.deadline)-Date.parse(value.closetime);
              }
          });
      }
      $('div.savetime').find('span').text(Math.floor(savedtime/(1000*3600*24))+"days");
    }
}

function showquotes(){
  if(flagpart){
    storage.get("dailyquote", function(data) {
        if(data.dailyquote && (Date.parse(Date())-Date.parse(data.dailyquote.gettime))<days){
            var quote = data.dailyquote;
            $('span.quote').html(quote.contents.quote);
            $('span.author').html(quote.contents.author);
        }else{
            $.get("http://api.theysaidso.com/qod.json",function(data){
                quote = data;
                quote.gettime = (new Date()).toDateString();
                $('span.quote').html(quote.contents.quote);
                $('span.author').html(quote.contents.author);
                storage.set({"dailyquote":quote}, function() {
                    return 1
                });
            })
        }
    });
  }else{
    var quote = storage.get("dailyquote");
    if(quote && (Date.parse(Date())-Date.parse(quote.gettime))<days){
        $('span.quote').html(quote.contents.quote);
        $('span.author').html(quote.contents.author);
    }else{
        $.get("http://api.theysaidso.com/qod.json",function(data){
            quote = data;
            quote.gettime = (new Date()).toDateString();
            $('span.quote').html(quote.contents.quote);
            $('span.author').html(quote.contents.author);
            storage.set({"dailyquote":quote});
        })
    }
  }
}

function gotohistory(status){
  $.each($('div.showpromise input[type=checkbox]'),function(index,v){
    if(!$(v).prop('checked')){
      var unitem = $(v).next('span').text();
      savesingle("undones",unitem,1);
    }
    // FIXME: Can not save multiple items at the same time...
  });
  if(flagpart){
    storage.get("currentpromise", function(data) {
        kk = data.currentpromise;
        if(status=="mdone"){
          if(Date.parse(kk.deadline)-Date.parse(Date())>=0){
              kk.status = "done";
          }else{
              kk.status = "delay";
          }
        }else if(status == "msorry"){
          kk.status = "fail";
        }
        kk.closetime = Date();
        kk.marks = typeof(marks)=="undefined"?"":marks;
        storage.get("historypromise", function(data2) {
            var his = data2.historypromise;
            if(his == null){his = []};
            his.push(kk);
            storage.set({"historypromise":his}, function() {
                console.log('saved to history.')
                storage.remove("currentpromise", function() {
                    console.log('removed the current.')
                    $('div.cupromise').fadeOut(500).siblings('div.addpromise').fadeIn(800);
                });
            });
        });
    });
  }else{
    var kk = storage.get("currentpromise");
    if(status=="mdone"){
      if(Date.parse(kk.deadline)-Date.parse(Date())>=0){
          kk.status = "done";
      }else{
          kk.status = "delay";
      }
    }else if(status == "msorry"){
      kk.status = "fail";
    }
    kk.closetime = Date();
    kk.marks = typeof(marks)=="undefined"?"":marks
    var his = storage.get("historypromise");
    if(his == null){his = {}};
    var i = Object.keys(his).length;
    his[i] = kk;
    storage.set({"historypromise":his});
    storage.remove("currentpromise");
    $('div.cupromise').fadeOut(500).siblings('div.addpromise').fadeIn(800);
  }

  storage.remove("marks");
}

function showpop(mes){
  var meslayer = "<div class=hoverlayer>"+mes+"</div>";
  $('body').append(meslayer);
  $('div.hoverlayer').css("padding-top",$(window).height()/2-50);
  setTimeout(function(){
    $('div.hoverlayer').fadeOut(500).remove();
  },2000);
}

function notifshow(mes){
  var meslayer = "<div class=notiflayer>"+mes+"</div>";
  $('body').append(meslayer);
}


function savesingle(itemname,index,value){
  if(flagpart){
    storage.get(itemname, function(data) {
      if(Object.keys(data).length==0){
        data[index] = value;
        if(itemname=="marks"){
          storage.set({"marks":data});
          marks = data;
        }
        if(itemname=="undones"){
          storage.set({"undones":data});
          undones = data;
        }
      }else{
        // console.log(data);
        data[itemname][index] = value;
        if(itemname=="marks"){
          storage.set({"marks":data[itemname]});
          marks = data[itemname];
        }
        if(itemname=="undones"){
          storage.set({"undones":data[itemname]});
          undones = data[itemname];
        }
      }
    })
  }else{
    var data = storage.get(itemname);
    if(data==null){
      data[index] = value;
      if(itemname=="marks"){
        storage.set({"marks":data});
        marks = data;
      }
      if(itemname=="undones"){
        storage.set({"undones":data});
        undones = data;
      }
    }else{
      // console.log(data);
      data[index] = value;
      if(itemname=="marks"){
        storage.set({"marks":data});
        marks = data;
      }
      if(itemname=="undones"){
        storage.set({"undones":data});
        undones = data;
      }
    }
  }
}
