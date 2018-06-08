$(document).ajaxError(function(e, xhr, settings, exception) {
    $('#piechart').text('No results')  
})


var forum = new Vue({
    el: '#content',
    delimiters: ["[[", "]]"],
    data: {
        topic: '',
        topics: [],
        posts: [],
        topic_timeline: false
    },
    created () {
        $.get('/get_topics', function(json){
            setTopics(json)
            autocomplete(document.getElementById("search"), forum.topics)
        })
    },
    methods:{
        getTopicPosts: function(event){
            event.preventDefault()
            $.get('/get_posts/' + this.topic, function(json){
                if (json.posts.length == 0){
                    $('#piechart').text('No results')
                    setTopicTimeline(false)
                    return
                }
                setPosts(json.posts)
                setTopicTimeline(true)
                var chartData = json.authors
                chartData.splice(0, 0, ['Author', 'Posts'])
        
                var options = {
                    'title': json.topic,
                    'width': 800,
                    'height': 450,
                    'pieHole': 0.4,
                    'backgroundColor': '#e6e6e6'
                }
                drawChart(chartData, options)
            })
        }
    }
})


function setTopics(data){
    forum.topics = data
}
function setTopic(data){
    forum.topic = data
}
function setPosts(data){
    forum.posts = data
}
function setTopicTimeline(flag){
    forum.topic_timeline = flag
}


google.charts.load('current', {'packages':['corechart']})
function drawChart(dataChart, options){
    var data = google.visualization.arrayToDataTable(dataChart)
    var chart = new google.visualization.PieChart(document.getElementById('piechart'))
    chart.draw(data, options)
}


function autocomplete(inp, topics) {
    var currentFocus

    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value

        closeAllLists()
        if (!val) { return false;}
        currentFocus = -1
      
        a = document.createElement("DIV")
        a.setAttribute("id", this.id + "autocomplete-list")
        a.setAttribute("class", "autocomplete-items")
        this.parentNode.appendChild(a)
        
        for (i = 0; i < topics.length; i++) {
            if (topics[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                b = document.createElement("DIV")
                b.innerHTML = "<strong>" + topics[i].substr(0, val.length) + "</strong>"
                b.innerHTML += topics[i].substr(val.length);
                b.innerHTML += "<input type='hidden' value='" + topics[i] + "'>"

                b.addEventListener("click", function(e) { 
                    setTopic(this.getElementsByTagName("input")[0].value)
                    closeAllLists()
                })
                a.appendChild(b)
            }
        }
    })
 
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list")
        if (x) x = x.getElementsByTagName("div")
        if (e.keyCode == 40) {
            currentFocus++
            addActive(x)
        } else if (e.keyCode == 38) {
            currentFocus--
            addActive(x)
        } else if (e.keyCode == 13) {
            e.preventDefault()
            if (currentFocus > -1) {
                if (x) {
                    x[currentFocus].click()
                    currentFocus = -1
                    forum.getTopicPosts(e)
                }
            } else {
                forum.getTopicPosts(e)
                closeAllLists()
            }
        }
    })
  
    function addActive(x) {
        if (!x) return false
        removeActive(x)

        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1)
        x[currentFocus].classList.add("autocomplete-active")
    }
    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active")
        }
    }
    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i])
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target)
    });
}
