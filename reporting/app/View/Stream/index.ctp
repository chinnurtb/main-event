<div class="grid_12">
  <h1>Stream</h1>
</div>

<hr class="grid_12">

<div id="stream_view" class="grid_12">
  <a href="#" class="realtime_toggle btn">Toggle Real-Time</a>
  <a href="#" class="more_data btn">Load More Data</a>
</div>

<script type="text/template" id="person-view-template">
  <div class="person-view" style="margin-top:15px; position:relative;">
    <h3><% print(person_id); %></h3>
    <span style="position:absolute;top:5px;right:0;color:#999;">Last seen: <% print(last_seen); %></span>
    <div class="pagination">
      <ul>
      <%
        var num_events = events.length;
        for (var i = (num_events - 1); i >= 0; i--) {
          %><li class="event-label event-<% print(events[i].event); %>"><a href="/events/details/p:<?= $project_id; ?>/e:<% print(events[i].event); %>"><% print(events[i].event); %> (<span class="event-ts"><% print(events[i].ts); %></span>)</a></li><%
          if(i > 0) {
            %><li class="active"><a>=></a></li><%
          }
        }
      %>
      </ul>
    </div>
  </div>
</script>
<script type="text/template" id="stream-view-template">
  <%
    var num_people = people.length;
    for (var i = 0; i < num_people; i++) {
      print(people[i].render());
    }
  %>
</script>
<script>
  require(['stream-view'], function(StreamView) {
    var mySV = new StreamView({
      api_info: <?=json_encode($api_info);?>,
      people: <?=json_encode($people);?>,
      container: '#stream_view'
    });

    mySV.init();
  });
</script>