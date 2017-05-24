var audioplayer =$('audio')[0],
	lyricArr = [];

function getMusic(){
	$.ajax({
		url:"http://api.jirengu.com/fm/getSong.php",
		dataType:"json",
		method:"get",
		data:{
			"channel":"public_fengge_xiaoqingxin"
		},
		success:function(ret){
			var songObject = ret.song[0];
			var {artist, lrc, picture, sid, title, url} = songObject;
			/*获取歌曲信息*/
			$('.m-head > img').attr('src',picture);
			$('.title').html(title);
			$('audio').attr('src',url);
			$('audio').attr('sid',sid);
			getLyric(sid);
			
		}
	})
} 

function getLyric(sid){
	$.ajax({
		url:"http://api.jirengu.com/fm/getLyric.php",
		dataType:"text",
		method:"post",
		data:{
			"sid":sid
		},
		success:function(ly){
			var lyric= JSON.parse(ly).lyric;
			var line = lyric.split('\n');
			var timeReg = /\[\d{2}:\d{2}.\d{2}\]/g;
			var result=[];
			if(line!=""){
				for(var i in line){
					var time = line[i].match(timeReg);
					if (!time) {
						continue;
					}
					var value=line[i].replace(timeReg,"");
					for(j in time){
						var t = time[j].slice(1,-1).split(':');
						var timeArr = parseInt(t[0],10)*60+parseFloat(t[1]);
						result.push([timeArr,value]);
					}
				}
			}
			result.sort(function(a,b){
				return a[0] - b[0];
			})
			lyricArr = result;
			renderLyric();
		}
	})
}
function renderLyric(){
	var lyrLi = "";
	for(var i = 0;i<lyricArr.length;i++){
		lyrLi += "<li data-time='"+lyricArr[i][0]+"'>"+lyricArr[i][1]+"</li>" 
	}
	$('.m-lyrics').append(lyrLi);
	setInterval(showLyric,100);
}


function play(){
	audioplayer.play();
	$('.control').removeClass('icon-bofang').addClass('icon-weibiaoti1');
}
function pause(){
	audioplayer.pause();
	$('.control').removeClass('icon-weibiaoti1').addClass('icon-bofang');
}

function controlBar(){
	/*获取音乐的总时长duration和当先播放时间currentTime*/
	var move = audioplayer.currentTime/audioplayer.duration*100;
	$('.bar-change').width(move+'%');
	if(audioplayer.currentTime == audioplayer.duration){
		getMusic();
	}
}

/*控制进度条*/
function changebBar(obj){
	var clickX = window.event.clientX;
	var barBoxX = $(obj).offset().left;
	var barWidth = $(obj).width();
	audioplayer.currentTime = (clickX - barBoxX)/barWidth*audioplayer.duration;
}

function showLyric(){
	var liH = $(".m-lyrics li").eq(5).outerHeight() - 3; 
        for (var i = 0; i < lyricArr.length; i++) {
            var curT = $(".m-lyrics li").eq(i).attr("data-time");
            var nexT = $(".m-lyrics li").eq(i + 1).attr("data-time");
            var curTime = audioplayer.currentTime;
            if ((curTime > curT) && (curT < nexT)) {
                $(".m-lyrics li").removeClass("active");
                $(".m-lyrics li").eq(i).addClass("active");
                $('.m-lyrics').css('top', -liH * (i - 2));
            }
        }
}


setInterval(controlBar,500)

getMusic();

$('.control').on('click',function(){
	if (audioplayer.paused) {
		play();
	}else{
		pause();
	}
})

$('.bar').on('click',function(event){
	changebBar(this)

})

