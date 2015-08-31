javascript:(function($) {
  'use strict';

  function getTicketsInEpic() {
    return $('tr.issuerow').map(function(index, row) {
      var $row = $(row);
      return {
        key: $row.data('issuekey'),
        summary: $row.find('td.ghx-summary').text(),
        issueType: $row.find('td.issuetype &gt; img').attr('title'),
        status: $row.find('td.status &gt; span').text(),
        assignee: $row.find('td.assignee &gt; a').text() || 'Unassigned',
        id: $row.find('td.issue_actions a')[0].id.match(/actions_(.+)/)[1]
      }
    }).toArray();
  };

  function rankToTop(id, callback) {
    $.ajax({
      url: '//jira.twitter.biz/rest/greenhopper/1.0/rank/global/first',
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify({
        issueId: id
      }),
      complete: callback,
    });
  };

  function createNotification() {
    var $notification = $('&lt;div/&gt;');
    $notification.css({
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: '300px',
      height: '66px',
      'line-height': '66px',
      'text-align': 'center',
      'border-color': '#7dc7ed',
      'background-color': '#cce9f8',
      'border-width': '2px',
      'border-radius': '2px',
      'border-style': 'solid',
    });
    return $notification;
  };

  function updateNotification(updated, total) {
    $notification.text(updated + ' / ' + total + ' tickets ranked');
  };

  var ordering = {
    'Open': 1,
    'Accepted': 2,
    'In Progress': 3,
    'Reviewable': 4,
    'Merged': 5,
    'Resolved': 6,
  };

  var sortedTickets = getTicketsInEpic().sort(function(ticket1, ticket2) {
    return (ordering[ticket1.status] || -1) - (ordering[ticket2.status] || -1)
  }).reverse();

  var $notification = createNotification();
  $('body').append($notification);

  var i = 0;
  function iter(tickets, done) {
    if (i &lt; tickets.length) {
      updateNotification(i, tickets.length);
      rankToTop(tickets[i].id, iter.bind(null, tickets, done));
      i++;
    }
    else {
      done();
    }
  };

  iter(sortedTickets, function() {
    $notification.text('Reloading page ...');
    window.location.reload();
  });

})(jQuery);
